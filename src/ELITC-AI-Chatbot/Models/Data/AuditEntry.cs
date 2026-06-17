using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace ELITC_AI_Chatbot.Models.Data;

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public Dictionary<string, object?> KeyValues { get; } = new Dictionary<string, object?>();
    public Dictionary<string, object?> OldValues { get; } = new Dictionary<string, object?>();
    public Dictionary<string, object?> NewValues { get; } = new Dictionary<string, object?>();
    public string AuditType { get; set; } = string.Empty;
    public List<PropertyEntry> TemporaryProperties { get; } = new List<PropertyEntry>();

    public bool HasTemporaryProperties => TemporaryProperties.Any();

    public AuditLog ToAudit()
    {
        var audit = new AuditLog
        {
            Id = Guid.NewGuid().ToString(),
            UserId = UserId,
            Username = Username,
            Action = AuditType,
            EntityName = TableName,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            EntityId = JsonSerializer.Serialize(KeyValues)
        };

        var changes = new Dictionary<string, object?>();
        if (OldValues.Any()) changes["OldValues"] = OldValues;
        if (NewValues.Any()) changes["NewValues"] = NewValues;
        
        audit.Changes = JsonSerializer.Serialize(changes);
        return audit;
    }
}
