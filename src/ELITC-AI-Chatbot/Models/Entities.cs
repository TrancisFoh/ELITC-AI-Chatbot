using System.ComponentModel.DataAnnotations;

namespace ELITC_AI_Chatbot.Models;

public class Course
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Synopsis { get; set; } = string.Empty;
    public string TargetAudience { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class Config
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class ChatLog
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public long Timestamp { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public List<Course>? RelatedCourses { get; set; }
}

public class ErrorLog
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string Component { get; set; } = string.Empty;
    public long Timestamp { get; set; }
}

public class AuditLog
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Changes { get; set; } = string.Empty;
    public long Timestamp { get; set; }
}

public class WebPageContent
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TextContent { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public long LastScraped { get; set; }
    public string Label { get; set; } = string.Empty;
}

