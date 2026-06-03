using System.ComponentModel.DataAnnotations;

namespace ELITC_AI_Chatbot.Models;

public class Course
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Topics { get; set; } = string.Empty;
    public string Prerequisites { get; set; } = string.Empty;
    public string Certification { get; set; } = string.Empty;
    public string Roles { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
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
