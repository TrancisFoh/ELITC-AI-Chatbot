using ELITC_AI_Chatbot.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ELITC_AI_Chatbot.Models.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Course> Courses { get; set; } = default!;
    public DbSet<Config> Configs { get; set; } = default!;
    public DbSet<ChatLog> ChatLogs { get; set; } = default!;
    public DbSet<ErrorLog> ErrorLogs { get; set; } = default!;
}
