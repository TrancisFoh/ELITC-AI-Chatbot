using ELITC_AI_Chatbot.Controllers;
using ELITC_AI_Chatbot.Models;
using ELITC_AI_Chatbot.Models.Data;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;

namespace NewSystem.Tests;

public class DbServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<AuthenticationStateProvider> _mockAuthStateProvider;
    private readonly DbService _dbService;
    private readonly SqliteConnection _connection;

    public DbServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        _mockAuthStateProvider = new Mock<AuthenticationStateProvider>();

        // Mock a default authenticated user
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "testuser"),
            new Claim(ClaimTypes.NameIdentifier, "test-id")
        }, "mock"));

        _mockAuthStateProvider.Setup(a => a.GetAuthenticationStateAsync())
            .ReturnsAsync(new AuthenticationState(user));

        _dbService = new DbService(_context, _mockAuthStateProvider.Object);
    }

    [Fact]
    public async Task SaveCourseAsync_ShouldAddNewCourse_WhenCourseDoesNotExist()
    {
        // Arrange
        var course = new Course
        {
            Id = "test-course-1",
            Title = "Test Course",
            Category = "Test Category",
            Level = "Beginner"
        };

        // Act
        await _dbService.SaveCourseAsync(course);

        // Assert
        var savedCourse = await _context.Courses.FindAsync("test-course-1");
        Assert.NotNull(savedCourse);
        Assert.Equal("Test Course", savedCourse.Title);

        // Verify Audit Log
        // Note: EntityId in AuditLog is JSON serialized dictionary of keys
        var auditLog = await _context.AuditLogs.FirstOrDefaultAsync(l => l.Username == "testuser");
        Assert.NotNull(auditLog);
        Assert.Contains("test-course-1", auditLog.EntityId);
        Assert.Equal("testuser", auditLog.Username);
    }

    [Fact]
    public async Task SaveCourseAsync_ShouldUpdateCourse_WhenCourseExists()
    {
        // Arrange
        var course = new Course
        {
            Id = "test-course-1",
            Title = "Original Title",
            Category = "Test Category"
        };
        await _dbService.SaveCourseAsync(course);

        // Act
        course.Title = "Updated Title";
        await _dbService.SaveCourseAsync(course);

        // Assert
        var updatedCourse = await _context.Courses.FindAsync("test-course-1");
        Assert.Equal("Updated Title", updatedCourse!.Title);
    }

    [Fact]
    public async Task DeleteCourseAsync_ShouldRemoveCourse()
    {
        // Arrange
        var course = new Course { Id = "delete-me", Title = "Delete Me" };
        await _dbService.SaveCourseAsync(course);

        // Act
        await _dbService.DeleteCourseAsync("delete-me");

        // Assert
        var deletedCourse = await _context.Courses.FindAsync("delete-me");
        Assert.Null(deletedCourse);
    }

    [Fact]
    public async Task IncrementTotalTokensAsync_ShouldUpdateConfigValue()
    {
        // Act
        await _dbService.IncrementTotalTokensAsync(100);
        await _dbService.IncrementTotalTokensAsync(50);

        // Assert
        var config = await _context.Configs.FirstOrDefaultAsync(c => c.Key == "TOTAL_TOKENS_USED");
        Assert.NotNull(config);
        Assert.Equal("150", config.Value);
    }

    [Fact]
    public async Task SaveChatLogAsync_ShouldDeleteOldLogs()
    {
        // Arrange
        var oldTimestamp = DateTimeOffset.UtcNow.AddDays(-10).ToUnixTimeMilliseconds();
        var oldLog = new ChatLog { Id = "old", SessionId = "s1", Content = "old", Timestamp = oldTimestamp };
        _context.ChatLogs.Add(oldLog);
        await _context.SaveChangesAsync();

        var newLog = new ChatLog { Id = "new", SessionId = "s1", Content = "new" };

        // Act
        await _dbService.SaveChatLogAsync(newLog);

        // Assert
        var logs = await _context.ChatLogs.ToListAsync();
        Assert.Single(logs);
        Assert.Equal("new", logs[0].Content);
        Assert.Null(await _context.ChatLogs.FindAsync("old"));
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Close();
        _connection.Dispose();
    }
}
