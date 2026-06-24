using System.Text.Json;
using System.Text.Json.Serialization;
using ELITC_AI_Chatbot.Models;
using Microsoft.EntityFrameworkCore;

namespace ELITC_AI_Chatbot.Controllers;

public class GeminiService(HttpClient httpClient, DbService dbService, IConfiguration config)
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly DbService _dbService = dbService;
    private readonly string _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? config["GEMINI_API_KEY"] ?? "";

    // We will use gemini-1.5-flash-latest as the default model
    private readonly string _model = "gemini-3.1-flash-lite";

    /// <summary>
    /// Checks if the Gemini API is reachable and the API key is valid.
    /// Returns (isHealthy, statusMessage).
    /// </summary>
    public async Task<(bool IsHealthy, string Message)> CheckHealthAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
            return (false, "API key missing");

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}?key={_apiKey}";
            using var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
                return (true, "Chatbot Online");

            return (false, $"API Error ({(int)response.StatusCode})");
        }
        catch (HttpRequestException)
        {
            return (false, "Connection Failed");
        }
        catch (TaskCanceledException)
        {
            return (false, "Request Timeout");
        }
        catch (Exception)
        {
            return (false, "Unknown Error");
        }
    }

    public async IAsyncEnumerable<string> StreamChatAsync(List<ChatLog> history, string userMessage, string sessionId, List<Course>? relevantCourses = null, List<WebPageContent>? relevantPages = null)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            yield return "Error: Gemini API Key is missing from configuration.";
            yield break;
        }

        // 1. Fetch System Prompt from DB
        var configs = await _dbService.GetAllConfigsAsync();
        var systemPromptConfig = configs.FirstOrDefault(c => c.Key == "SYSTEM_PROMPT");
        var defaultPrompt = """
            You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre (https://www.elitc.com/).

            Primary Objective:
            Your mission is to provide helpful information about ELITC's services, courses, and facilities. While you aim to help users discover training that benefits their career or company, always address their specific questions first (location, contact, etc.) before pivoting to consultation. You are a professional and helpful guide for the Electronics Industries Training Centre.

            Consultative Approach:
            1. Direct Recommendations: When a user asks about a topic, immediately suggest 1 or 2 relevant courses rather than asking follow-up questions first.
            2. Personalize Recommendations: Briefly explain exactly *why* the suggested course is a good fit.
            3. Keep responses concise but warm (max 3-4 sentences).
            4. End by asking if they would like to enroll or learn more about the suggested course.

            Proactive Behavior:
            - Always try to recommend a specific course immediately to reduce friction.
            - You can "trigger" course displays by mentioning specific categories like "WSQ Courses", "AI & Digital", "IPC Training", "Foreign Workers", or "Skills Improvement".

            Key Info:
            - Training for SMEs / MNCs.
            - Location: Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870
            - Contact: +65 6483 2535 | enquiry@elitc.com
            - Free consultation available for Workforce Skills Qualifications (WSQ) roadmaps.

            Course Categories:
            - Workforce Skills Qualifications (WSQ) Courses
            - Work Skills Improvement (WSI) Courses
            - IPC Certification Training / Workshop
            - AI and Digital Transformation Courses
            - Foreign Workers Courses

            Response Style:
            - Professional, encouraging, and consultative.
            - Use Markdown for bolding key terms.
            - Use emojis to feel approachable (👋, 📚, 🚀, 🎯)
            """;
        var systemInstructionText = systemPromptConfig?.Value ?? defaultPrompt;

        // 2. Add relevant courses context if any
        if (relevantCourses != null && relevantCourses.Any())
        {
            var courseContext = "Here are the relevant courses based on the user's inquiry:\n" +
                JsonSerializer.Serialize(relevantCourses.Select(c => new { c.Title, c.Category, c.Synopsis, c.Level, c.TargetAudience, c.Duration, c.Url }));
            systemInstructionText += "\n\n" + courseContext;
        }

        // 2.5 Add relevant pages context if any
        if (relevantPages != null && relevantPages.Any())
        {
            var pageContext = "Here is some additional relevant information from the website based on the user's inquiry:\n" +
                JsonSerializer.Serialize(relevantPages.Select(p => new { p.Title, p.TextContent, p.Url }));
            systemInstructionText += "\n\n" + pageContext;
        }

        // 3. Build the Request Payload for Gemini API
        var requestPayload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemInstructionText } }
            },
            contents = BuildContents(history, userMessage),
            generationConfig = new
            {
                temperature = 0.1, // A low temperature (e.g. 0.1) makes the AI more precise, factual, and less likely to hallucinate
                topP = 0.8,
                topK = 40
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:streamGenerateContent?key={_apiKey}";

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestPayload), System.Text.Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();

            // Log error
            await _dbService.SaveErrorLogAsync(new ErrorLog
            {
                Id = $"ERR-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                SessionId = sessionId,
                ErrorMessage = $"Gemini API Error {response.StatusCode}: {error}",
                Component = "GeminiService.StreamChatAsync",
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            });

            yield return "I'm having a small technical hiccup. 💫 Could you please try sending that again?";
            yield break;
        }

        using var stream = await response.Content.ReadAsStreamAsync();

        // 4. Read the JSON array stream
        string fullResponse = "";

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        await foreach (var chunkDoc in JsonSerializer.DeserializeAsyncEnumerable<JsonElement>(stream, options))
        {
            if (chunkDoc.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var firstCandidate = candidates[0];
                if (firstCandidate.TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0)
                {
                    var textChunk = parts[0].GetProperty("text").GetString() ?? "";
                    fullResponse += textChunk;
                    yield return fullResponse;
                }
            }

            if (chunkDoc.TryGetProperty("usageMetadata", out var usage) && 
                usage.TryGetProperty("totalTokenCount", out var totalTokensElement))
            {
                if (totalTokensElement.ValueKind == JsonValueKind.Number)
                {
                    int tokens = totalTokensElement.GetInt32();
                    await _dbService.IncrementTotalTokensAsync(tokens);
                }
            }
        }

        // 4. Log the interaction to DB
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        await _dbService.SaveChatLogAsync(new ChatLog
        {
            Id = $"MSG-{timestamp}-user",
            SessionId = sessionId,
            Role = "user",
            Content = userMessage,
            Timestamp = timestamp
        });

        await _dbService.SaveChatLogAsync(new ChatLog
        {
            Id = $"MSG-{timestamp + 1}-model",
            SessionId = sessionId,
            Role = "model",
            Content = fullResponse,
            Timestamp = timestamp + 1
        });
    }

    public async Task<string> RefineScrapedDataAsync(string content, string instruction)
    {
        if (string.IsNullOrEmpty(_apiKey)) return "Error: API key missing";

        var systemPrompt = $"You are an expert data cleaner and editor. Refine the provided scraped web page content based on the following instruction: {instruction}. Return ONLY the refined content, keeping the same Markdown format. Do not add any conversational preamble.";

        var requestPayload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents = new[] { new { role = "user", parts = new[] { new { text = content } } } },
            generationConfig = new { temperature = 0.2 }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestPayload), System.Text.Encoding.UTF8, "application/json")
        };

        try
        {
            using var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "";
            }
            return $"Error: API returned {(int)response.StatusCode}";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    public async Task<List<string>> GenerateSuggestedRepliesAsync(List<ChatLog> history)
    {
        if (string.IsNullOrEmpty(_apiKey)) return new List<string>();

        var systemPrompt = "Based on the conversation history, generate exactly 3 short, relevant follow-up questions or statements the user might naturally say next. Respond ONLY with a raw JSON array of 3 strings. Keep them under 6 words each. Example: [\"Tell me more about the WSQ courses.\", \"What is the cost?\", \"Can I talk to a human?\"]";

        var requestPayload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents = BuildContents(history, ""),
            generationConfig = new { responseMimeType = "application/json" }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestPayload), System.Text.Encoding.UTF8, "application/json")
        };

        try
        {
            using var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                
                if (!string.IsNullOrEmpty(text))
                {
                    return JsonSerializer.Deserialize<List<string>>(text) ?? new List<string>();
                }
            }
        }
        catch
        {
            // fallback gracefully
        }
        return new List<string>();
    }

    private List<object> BuildContents(List<ChatLog> history, string userMessage)
    {
        var contents = new List<object>();

        // Sort history by timestamp
        var sortedHistory = history.OrderBy(h => h.Timestamp).ToList();

        foreach (var msg in sortedHistory)
        {
            // Gemini API roles are 'user' and 'model'
            var role = msg.Role == "user" ? "user" : "model";
            contents.Add(new
            {
                role = role,
                parts = new[] { new { text = msg.Content } }
            });
        }

        // Add the current user message
        if (!string.IsNullOrEmpty(userMessage))
        {
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });
        }

        return contents;
    }
}
