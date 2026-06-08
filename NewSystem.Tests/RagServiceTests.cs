using ELITC_AI_Chatbot.Controllers;
using ELITC_AI_Chatbot.Models;
using Xunit;

namespace NewSystem.Tests;

public class RagServiceTests
{
    private readonly RagService _ragService;
    private readonly List<Course> _courses;

    public RagServiceTests()
    {
        _ragService = new RagService();
        _courses = new List<Course>
        {
            new Course { Id = "c1", Title = "WSQ Digital Marketing", Category = "WSQ", Synopsis = "Learn social media marketing." },
            new Course { Id = "c2", Title = "Advanced Excel for Finance", Category = "Finance", Synopsis = "Excel data analysis." },
            new Course { Id = "c3", Title = "AI for Productivity", Category = "AI & Digital", Synopsis = "Using ChatGPT at work." },
            new Course { Id = "c4", Title = "Workplace Safety", Category = "IPC", Synopsis = "Safety first in the office." }
        };
    }

    [Fact]
    public void RetrieveCourses_ShouldReturnExactIdMatch()
    {
        // Act
        var results = _ragService.RetrieveCourses("c2", _courses);

        // Assert
        Assert.NotEmpty(results);
        Assert.Equal("c2", results[0].Id);
    }

    [Fact]
    public void RetrieveCourses_ShouldReturnRelevantCoursesByTitle()
    {
        // Act
        var results = _ragService.RetrieveCourses("digital marketing", _courses);

        // Assert
        Assert.Contains(results, c => c.Title.Contains("Digital Marketing"));
    }

    [Fact]
    public void RetrieveCourses_ShouldIgnoreStopWords()
    {
        // Act
        var results = _ragService.RetrieveCourses("I want to learn about AI", _courses);

        // Assert
        Assert.NotEmpty(results);
        Assert.Equal("c3", results[0].Id);
    }

    [Fact]
    public void RetrieveCourses_ShouldReturnEmpty_WhenNoMatch()
    {
        // Act
        var results = _ragService.RetrieveCourses("Cooking class", _courses);

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void RetrieveCourses_ShouldHandlePunctuation()
    {
        // Act
        var results = _ragService.RetrieveCourses("AI!!!", _courses);

        // Assert
        Assert.NotEmpty(results);
        Assert.Equal("c3", results[0].Id);
    }
}
