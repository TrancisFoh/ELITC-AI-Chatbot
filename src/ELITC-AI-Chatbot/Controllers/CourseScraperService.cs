using System.Text.RegularExpressions;
using HtmlAgilityPack;
using ELITC_AI_Chatbot.Models;
using System.Text;

namespace ELITC_AI_Chatbot.Controllers;

public class CourseScraperService
{
    private readonly HttpClient _httpClient;

    private static readonly Dictionary<string, string> Replacements = new()
    {
        {"\u2018", "'"}, {"\u2019", "'"}, {"\u201A", "'"}, {"\u201B", "'"},
        {"\u201C", "\""}, {"\u201D", "\""}, {"\u201E", "\""},
        {"\u2013", "-"}, {"\u2014", "-"}, {"\u2015", "-"}, {"\u2026", "..."},
        {"\u2022", "-"}, {"\u00A0", " "}, {"\u00AD", ""},
        {"\uFB00", "ff"}, {"\uFB01", "fi"}, {"\uFB02", "fl"}, {"\uFB03", "ffi"}, {"\uFB04", "ffl"},
        {"\u0153", "oe"}, {"\u00E6", "ae"},
        {"â€™", "'"}, {"â€˜", "'"}, {"â€œ", "\""}, {"â€\u009d", "\""}, {"â€", "\""}, {"â€¢", "-"}, {"â€¦", "..."},
        {"ï¿½", "'"}, {"Â", ""},
        {"Ã¡", "a"}, {"Ã©", "e"}, {"Ã-", "i"}, {"Ã³", "o"}, {"Ãº", "u"}, {"Ã±", "n"}, {"Ã¼", "u"}, {"Ã«", "e"},
        {"Ã ", "a"}, {"Ãè", "e"}, {"Ã¬", "i"}, {"Ã²", "o"}, {"Ã¹", "u"},
        {"ï¬\u0081", "fi"}, {"ï¬\u0082", "fl"}, {"ï¬\u0080", "ff"}, {"ï¬\u0083", "ffi"}, {"ï¬\u0084", "ffl"}
    };

    private static readonly string[] SectionMarkers = {
        "Course Objective", "Course Objectives:", "Objectives:", "Course Objectives",
        "Course Outcome", "Course Outcomes:", "Course Outcomes", "Course Outcome:",
        "Course Structure", "Course Outline", "For Whom", "Target Audience",
        "Entry Requirements", "Training Medium", "Training Methodology",
        "Certification", "Certificate", "Funding Available", "Nett Course Fee",
        "Course Overview", "Who Should Attend", "Description", "Enquire Further",
        "Standard for", "Prerequisites", "Assumed Skills"
    };

    public CourseScraperService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
        _httpClient.Timeout = TimeSpan.FromSeconds(15);
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        text = HtmlEntity.DeEntitize(text);

        foreach (var kvp in Replacements)
        {
            text = text.Replace(kvp.Key, kvp.Value);
        }

        // Collapse runs of spaces (but preserve newlines)
        text = Regex.Replace(text, @"[^\S\n]+", " ");
        return text.Trim();
    }

    private string ExtractSection(string text, string[] startHeadings, string[] endHeadings)
    {
        var sortedStart = startHeadings.OrderByDescending(h => h.Length).Select(Regex.Escape);
        var startPattern = string.Join("|", sortedStart);
        var endPattern = string.Join("|", endHeadings.Select(Regex.Escape));

        var pattern = $@"(?:{startPattern})\s*(.*?)(?=\n\s*(?:{endPattern})|\z)";
        var match = Regex.Match(text, pattern, RegexOptions.Singleline | RegexOptions.IgnoreCase);

        if (match.Success)
        {
            var result = Regex.Replace(match.Groups[1].Value.Trim(), @"\n{2,}", "\n").Trim(':').Trim();
            return string.IsNullOrEmpty(result) ? "" : result;
        }
        return "";
    }

    public async Task<Course> ScrapeCourseAsync(string url)
    {
        var course = new Course { Url = url };
        try
        {
            var html = await _httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Title
            var titleNode = doc.DocumentNode.SelectSingleNode("//h1[contains(@class, 'product_title')]");
            if (titleNode != null)
                course.Title = CleanText(titleNode.InnerText);

            // Category
            var catNode = doc.DocumentNode.SelectSingleNode("//span[contains(@class, 'posted_in')]/a");
            if (catNode != null)
            {
                course.Category = CleanText(catNode.InnerText);
            }
            else
            {
                var breadcrumbs = doc.DocumentNode.SelectNodes("//nav[contains(@class, 'woocommerce-breadcrumb')]/a");
                if (breadcrumbs != null && breadcrumbs.Count > 1)
                {
                    course.Category = CleanText(breadcrumbs[breadcrumbs.Count - 1].InnerText);
                }
                else
                {
                    var tags = doc.DocumentNode.SelectNodes("//a[@rel='tag']");
                    if (tags != null)
                    {
                        course.Category = string.Join(", ", tags.Select(t => CleanText(t.InnerText)));
                    }
                }
            }

            // Text extraction - getting all text separated by newlines
            var textBuilder = new StringBuilder();
            ExtractTextNodes(doc.DocumentNode, textBuilder);
            var pageText = CleanText(textBuilder.ToString());

            // Course Code
            var codeMatch = Regex.Match(pageText, @"(?:Course\s*)?Code\s*[:\-]\s*([A-Za-z0-9\-]+)", RegexOptions.IgnoreCase);
            if (codeMatch.Success)
            {
                course.Id = codeMatch.Groups[1].Value.Trim();
            }

            // Duration
            var durationMatch = Regex.Match(pageText, @"(?:Training Hours|Duration|Course Duration)\s*[:\-]\s*([^\n]+)", RegexOptions.IgnoreCase);
            if (durationMatch.Success)
            {
                course.Duration = durationMatch.Groups[1].Value.Trim();
            }

            // Sections
            var synopsis = ExtractSection(pageText, new[] { "Synopsis:", "Course Synopsis:", "Overview:", "Introduction.", "Introduction:", "Description:" }, SectionMarkers);
            var objectives = ExtractSection(pageText, new[] { "Course Objective:", "Course Objectives:", "Objectives:", "Course Objectives.", "Course Objective.", "Objective:" }, SectionMarkers);
            var targetAudience = ExtractSection(pageText, new[] { "For Whom:", "Target Audience:", "Who Should Attend:", "Target Audience.", "For Whom.", "Who Should Attend." }, SectionMarkers);
            var entryReqs = ExtractSection(pageText, new[] { "Entry Requirements:", "Prerequisites:", "Assumed Skills and Knowledge:", "Entry Requirement:" }, SectionMarkers);

            if (!string.IsNullOrEmpty(targetAudience))
            {
                course.TargetAudience = targetAudience;
            }

            // Combine Synopsis
            var combinedSynopsis = new StringBuilder();
            if (!string.IsNullOrEmpty(synopsis)) combinedSynopsis.AppendLine(synopsis);
            if (!string.IsNullOrEmpty(objectives))
            {
                if (combinedSynopsis.Length > 0) combinedSynopsis.AppendLine("\n");
                combinedSynopsis.AppendLine("### Course Objectives");
                combinedSynopsis.AppendLine(objectives);
            }
            if (!string.IsNullOrEmpty(entryReqs))
            {
                if (combinedSynopsis.Length > 0) combinedSynopsis.AppendLine("\n");
                combinedSynopsis.AppendLine("### Entry Requirements");
                combinedSynopsis.AppendLine(entryReqs);
            }
            course.Synopsis = combinedSynopsis.ToString().Trim();

            Console.WriteLine($"\n--- SCRAPING RESULTS ---");
            Console.WriteLine($"Title: {course.Title}");
            Console.WriteLine($"Category: {course.Category}");
            Console.WriteLine($"Level (Code): {course.Level}");
            Console.WriteLine($"Duration: {course.Duration}");
            Console.WriteLine($"Target Audience: {course.TargetAudience}");
            Console.WriteLine($"Synopsis Length: {course.Synopsis?.Length ?? 0}");
            Console.WriteLine($"\n--- PAGE TEXT (first 500 chars) ---");
            Console.WriteLine(pageText.Substring(0, Math.Min(500, pageText.Length)));
            Console.WriteLine($"------------------------\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Scraping failed: {ex.Message}");
        }

        return course;
    }

    private void ExtractTextNodes(HtmlNode node, StringBuilder sb)
    {
        if (node.NodeType == HtmlNodeType.Text)
        {
            var text = node.InnerText.Trim();
            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.Append(text).Append(" ");
            }
        }
        else if ((node.NodeType == HtmlNodeType.Element || node.NodeType == HtmlNodeType.Document) && node.Name != "script" && node.Name != "style")
        {
            bool isBlock = false;
            if (node.NodeType == HtmlNodeType.Element)
            {
                string name = node.Name.ToLowerInvariant();
                isBlock = name == "p" || name == "div" || name == "h1" || name == "h2" || name == "h3" || 
                          name == "h4" || name == "h5" || name == "h6" || name == "li" || name == "ul" || 
                          name == "ol" || name == "br" || name == "td" || name == "tr" || name == "table" ||
                          name == "blockquote" || name == "section" || name == "article";
                if (isBlock && sb.Length > 0 && sb[sb.Length - 1] != '\n')
                {
                    sb.AppendLine();
                }
            }

            foreach (var child in node.ChildNodes)
            {
                ExtractTextNodes(child, sb);
            }

            if (isBlock && sb.Length > 0 && sb[sb.Length - 1] != '\n')
            {
                sb.AppendLine();
            }
        }
    }
}
