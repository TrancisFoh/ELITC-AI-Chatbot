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

    public async IAsyncEnumerable<string> StreamChatAsync(List<ChatLog> history, string userMessage, string sessionId, List<Course>? relevantCourses = null)
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
            1. Be Inquisitive: If a user's request is broad (e.g., "I want to learn AI"), you MUST ask follow-up questions before giving a final recommendation. Ask about their current role, their technical background, and what they hope to achieve (e.g., career switch, upskilling for current job, or personal interest).
            2. Personalize Recommendations: Once you have information, explain exactly *why* a specific course (like WSQ or IPC) is the best fit for their specific situation.
            3. Keep responses concise but warm (max 3-4 sentences).
            4. ALWAYS end with a helpful follow-up question that helps narrow down their needs or moves them closer to a decision.

            Proactive Behavior:
            - If they are an individual, ask about their career aspirations or current industry.
            - If they are a company representative, ask about their team's current challenges or the specific skills they want to uplift.
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

        // 3. Build the Request Payload for Gemini API
        var requestPayload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemInstructionText } }
            },
            contents = BuildContents(history, userMessage)
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
        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = userMessage } }
        });

        return contents;
    }
}
