using ELITC_AI_Chatbot.Models.Data;
using ELITC_AI_Chatbot.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Components.Authorization;

namespace ELITC_AI_Chatbot.Controllers;

public class DbService(ApplicationDbContext context, AuthenticationStateProvider authStateProvider)
{
    private async Task SetAuditUserAsync()
    {
        var authState = await authStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        if (user.Identity?.IsAuthenticated == true)
        {
            context.CurrentUsername = user.Identity.Name ?? "System";
            context.CurrentUserId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "System";
        }
    }
    // --- Courses ---
    public async Task<List<Course>> GetAllCoursesAsync()
    {
        return await context.Courses.ToListAsync();
    }

    public async Task<Course?> GetCourseAsync(string id)
    {
        return await context.Courses.FindAsync(id);
    }

    public async Task SaveCourseAsync(Course course)
    {
        var existing = await context.Courses.FindAsync(course.Id);
        if (existing == null)
        {
            if (string.IsNullOrEmpty(course.Id))
            {
                course.Id = Guid.NewGuid().ToString();
            }
            context.Courses.Add(course);
        }
        else
        {
            context.Entry(existing).CurrentValues.SetValues(course);
        }
        await SetAuditUserAsync();
        await context.SaveChangesAsync();
    }

    public async Task DeleteCourseAsync(string id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course != null)
        {
            context.Courses.Remove(course);
            await SetAuditUserAsync();
            await context.SaveChangesAsync();
        }
    }

    // --- Web Pages ---
    public async Task<List<WebPageContent>> GetAllWebPagesAsync()
    {
        return await context.WebPages.ToListAsync();
    }

    public async Task<List<WebPageContent>> GetApprovedWebPagesAsync()
    {
        return await context.WebPages.Where(w => w.Status == "Approved").ToListAsync();
    }

    public async Task SaveWebPageAsync(WebPageContent page)
    {
        var existing = await context.WebPages.FindAsync(page.Id);
        if (existing == null)
        {
            if (string.IsNullOrEmpty(page.Id)) page.Id = Guid.NewGuid().ToString();
            context.WebPages.Add(page);
        }
        else
        {
            context.Entry(existing).CurrentValues.SetValues(page);
        }
        await SetAuditUserAsync();
        await context.SaveChangesAsync();
    }

    public async Task DeleteWebPageAsync(string id)
    {
        var page = await context.WebPages.FindAsync(id);
        if (page != null)
        {
            context.WebPages.Remove(page);
            await SetAuditUserAsync();
            await context.SaveChangesAsync();
        }
    }

    // --- Configs ---
    public async Task<List<Config>> GetAllConfigsAsync()
    {
        return await context.Configs.ToListAsync();
    }

    public async Task<string> GetConfigValueAsync(string key, string defaultValue = "")
    {
        var config = await context.Configs.FirstOrDefaultAsync(c => c.Key == key);
        return config?.Value ?? defaultValue;
    }

    public async Task SaveConfigAsync(Config config)
    {
        var existing = await context.Configs.FindAsync(config.Id);
        if (existing == null)
        {
            if (string.IsNullOrEmpty(config.Id))
            {
                config.Id = Guid.NewGuid().ToString();
            }
            context.Configs.Add(config);
        }
        else
        {
            context.Entry(existing).CurrentValues.SetValues(config);
        }
        await SetAuditUserAsync();
        await context.SaveChangesAsync();
    }

    public async Task IncrementTotalTokensAsync(int tokens)
    {
        var config = await context.Configs.FirstOrDefaultAsync(c => c.Key == "TOTAL_TOKENS_USED");
        if (config == null)
        {
            config = new Config { Id = Guid.NewGuid().ToString(), Key = "TOTAL_TOKENS_USED", Value = tokens.ToString() };
            context.Configs.Add(config);
        }
        else
        {
            if (long.TryParse(config.Value, out long currentTokens))
            {
                config.Value = (currentTokens + tokens).ToString();
            }
            else
            {
                config.Value = tokens.ToString();
            }
            context.Entry(config).State = EntityState.Modified;
        }
        await SetAuditUserAsync();
        await context.SaveChangesAsync();
    }

    // --- Logs ---
    public async Task SaveChatLogAsync(ChatLog log)
    {
        if (string.IsNullOrEmpty(log.Id)) log.Id = Guid.NewGuid().ToString();
        log.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        context.ChatLogs.Add(log);
        
        // 7-day retention policy
        var oneWeekAgo = DateTimeOffset.UtcNow.AddDays(-7).ToUnixTimeMilliseconds();
        var oldLogs = await context.ChatLogs.Where(c => c.Timestamp < oneWeekAgo).ToListAsync();
        if (oldLogs.Any())
        {
            context.ChatLogs.RemoveRange(oldLogs);
        }
        
        await context.SaveChangesAsync();
    }

    public async Task<List<string>> GetChatSessionsAsync()
    {
        return await context.ChatLogs
            .Select(c => c.SessionId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<ChatLog>> GetAllChatLogsAsync()
    {
        return await context.ChatLogs
            .OrderByDescending(c => c.Timestamp)
            .ToListAsync();
    }

    public async Task<List<ChatLog>> GetChatSessionMessagesAsync(string sessionId)
    {
        return await context.ChatLogs
            .Where(c => c.SessionId == sessionId)
            .OrderBy(c => c.Timestamp)
            .ToListAsync();
    }

    public async Task SaveErrorLogAsync(ErrorLog log)
    {
        if (string.IsNullOrEmpty(log.Id)) log.Id = Guid.NewGuid().ToString();
        log.Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        context.ErrorLogs.Add(log);
        await context.SaveChangesAsync();
    }

    public async Task<List<ErrorLog>> GetErrorLogsAsync()
    {
        return await context.ErrorLogs.OrderByDescending(e => e.Timestamp).ToListAsync();
    }

    public async Task ClearErrorLogsAsync()
    {
        context.ErrorLogs.RemoveRange(context.ErrorLogs);
        await context.SaveChangesAsync();
    }

    public async Task<List<AuditLog>> GetAuditLogsAsync()
    {
        return await context.AuditLogs.OrderByDescending(a => a.Timestamp).ToListAsync();
    }
}
