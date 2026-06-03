using System.Text.Json;
using System.Text.Json.Serialization;
using ELITC_AI_Chatbot.Models;
using Microsoft.EntityFrameworkCore;

namespace ELITC_AI_Chatbot.Services;

public class GeminiService(HttpClient httpClient, DbService dbService, IConfiguration config)
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly DbService _dbService = dbService;
    private readonly string _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? config["GEMINI_API_KEY"] ?? "";

    // We will use gemini-1.5-flash-latest as the default model
    private readonly string _model = "gemini-2.5-flash-preview";

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
        var defaultPrompt = "You are the ELITC Assistant, a helpful and knowledgeable AI for the Electronics Industries Training Centre (ELITC) in Singapore. You must ALWAYS answer as the ELITC Assistant. Be concise, polite, and directly address the user's questions about courses and training. Never say you are trained by Google or a large language model.";
        var systemInstructionText = systemPromptConfig?.Value ?? defaultPrompt;

        // 2. Add relevant courses context if any
        if (relevantCourses != null && relevantCourses.Any())
        {
            var courseContext = "Here are the relevant courses based on the user's inquiry:\n" +
                JsonSerializer.Serialize(relevantCourses.Select(c => new { c.Title, c.Category, c.Description, c.Level, c.Topics }));
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
