using System.Text.RegularExpressions;
using ELITC_AI_Chatbot.Models;

namespace ELITC_AI_Chatbot.Controllers;

public class RagService
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "i", "want", "to", "learn", "course", "courses", "in", "a", "the", "for", "about", 
        "please", "me", "show", "tell", "what", "is", "are", "any", "you", "have", "do", 
        "we", "need", "how", "can", "find", "search", "get", "with", "on", "at"
    };

    public List<Course> RetrieveCourses(string query, List<Course> courses, int limit = 10)
    {
        // Normalize query: to lowercase and remove punctuation (keeping alphanumeric and spaces)
        var normalizedQuery = Regex.Replace(query.ToLowerInvariant(), @"[^\w\s]", "");
        
        if (normalizedQuery.Contains("all") && (normalizedQuery.Contains("course") || normalizedQuery.Contains("training") || normalizedQuery.Contains("program")))
        {
            return courses.Take(limit).ToList();
        }

        // Split into tokens
        var tokens = normalizedQuery.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 1 && !StopWords.Contains(token))
            .ToList();

        if (!tokens.Any())
        {
            return new List<Course>();
        }

        var scoredCourses = courses.Select(course =>
        {
            int score = 0;

            // Exact ID match
            if (course.Id.Equals(normalizedQuery.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                score += 30;
            }

            var titleLower = course.Title.ToLowerInvariant();
            var synopsisLower = course.Synopsis.ToLowerInvariant();
            var categoryLower = course.Category.ToLowerInvariant();
            var audienceStr = course.TargetAudience.ToLowerInvariant();

            foreach (var token in tokens)
            {
                if (titleLower.Contains(token))
                {
                    score += 8;
                    if (Regex.IsMatch(titleLower, $@"\b{Regex.Escape(token)}\b"))
                    {
                        score += 4;
                    }
                }

                if (categoryLower.Contains(token))
                {
                    score += 5;
                }

                if (synopsisLower.Contains(token))
                {
                    score += 3;
                }

                if (audienceStr.Contains(token))
                {
                    score += 1;
                }
            }

            return new { Course = course, Score = score };
        });

        return scoredCourses
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .Select(x => x.Course)
            .Take(limit)
            .ToList();
    }

    public List<WebPageContent> RetrieveWebPages(string query, List<WebPageContent> webPages, int limit = 5)
    {
        var normalizedQuery = Regex.Replace(query.ToLowerInvariant(), @"[^\w\s]", "");
        var tokens = normalizedQuery.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 1 && !StopWords.Contains(token))
            .ToList();

        if (!tokens.Any()) return new List<WebPageContent>();

        var scoredPages = webPages.Select(page =>
        {
            int score = 0;
            var titleLower = page.Title.ToLowerInvariant();
            var contentLower = page.TextContent.ToLowerInvariant();

            foreach (var token in tokens)
            {
                if (titleLower.Contains(token))
                {
                    score += 8;
                    if (Regex.IsMatch(titleLower, $@"\b{Regex.Escape(token)}\b")) score += 4;
                }
                if (contentLower.Contains(token)) score += 2;
            }

            return new { Page = page, Score = score };
        });

        return scoredPages
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .Select(x => x.Page)
            .Take(limit)
            .ToList();
    }
}
