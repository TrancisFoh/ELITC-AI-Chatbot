using ELITC_AI_Chatbot.Models;
using ELITC_AI_Chatbot.Models.Data;
using HtmlAgilityPack;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace ELITC_AI_Chatbot.Controllers;

using ELITC_AI_Chatbot.Models;

public class WebCrawlerService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly string _baseUrl = "https://www.elitc.com";

    public WebCrawlerService(IServiceScopeFactory scopeFactory, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<CrawlReport> CrawlWebsiteAsync(IProgress<CrawlProgress>? progress = null)
    {
        var report = new CrawlReport();
        double totalConfidence = 0;
        using var scope = _scopeFactory.CreateScope();
        var _db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
        httpClient.Timeout = TimeSpan.FromSeconds(60);

        var visitedUrls = new HashSet<string>();
        var queuedUrls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var urlsToVisit = new PriorityQueue<string, int>();
        urlsToVisit.Enqueue(_baseUrl, 2);
        queuedUrls.Add(_baseUrl);

        // Enqueue Seed URLs with highest priority
        var seedUrls = _config.GetSection("CrawlerSettings:SeedUrls").Get<string[]>();
        if (seedUrls != null)
        {
            foreach (var seedUrl in seedUrls)
            {
                if (!string.IsNullOrWhiteSpace(seedUrl) && !queuedUrls.Contains(seedUrl))
                {
                    urlsToVisit.Enqueue(seedUrl, 0); // Highest priority
                    queuedUrls.Add(seedUrl);
                }
            }
        }

        int pagesScraped = 0;
        int maxPages = _config.GetValue<int>("CrawlerSettings:MaxPages", 500);

        while (urlsToVisit.Count > 0 && pagesScraped < maxPages)
        {
            var url = urlsToVisit.Dequeue();
            if (visitedUrls.Contains(url)) continue;

            visitedUrls.Add(url);

            if (progress != null)
            {
                progress.Report(new CrawlProgress
                {
                    CurrentUrl = url,
                    Processed = pagesScraped,
                    TotalDiscovered = visitedUrls.Count + urlsToVisit.Count
                });
            }

            // Skip known non-HTML assets and useless WordPress archive pages
            if (url.EndsWith(".pdf") || url.EndsWith(".jpg") || url.EndsWith(".png") || url.EndsWith(".zip"))
                continue;

            if (url.Contains("/product-tag/", StringComparison.OrdinalIgnoreCase) || 
                url.Contains("/product-category/", StringComparison.OrdinalIgnoreCase) ||
                url.Contains("/tag/", StringComparison.OrdinalIgnoreCase) ||
                url.Contains("/category/", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            try
            {
                var html = await httpClient.GetStringAsync(url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // Extract title
                var titleNode = doc.DocumentNode.SelectSingleNode("//title");
                var title = titleNode?.InnerText.Trim() ?? "Untitled Page";

                // Find links for further crawling BEFORE removing nav/footer elements
                var discoveredLinks = new List<string>();
                var links = doc.DocumentNode.SelectNodes("//a[@href]");
                if (links != null)
                {
                    foreach (var link in links)
                    {
                        var href = link.GetAttributeValue("href", string.Empty);
                        if (href.StartsWith("/") || href.StartsWith(_baseUrl))
                        {
                            var fullUrl = href.StartsWith("/") ? _baseUrl + href : href;
                            var cleanUrl = fullUrl.Split('#')[0].Split('?')[0];
                            discoveredLinks.Add(cleanUrl);
                        }
                    }
                }

                string textContent = "";
                bool isCoursePage = url.Contains("/product/", StringComparison.OrdinalIgnoreCase);
                
                if (isCoursePage)
                {
                    var sb = new System.Text.StringBuilder();
                    
                    var productTitleNode = doc.DocumentNode.SelectSingleNode("//h1[contains(@class, 'product_title')]");
                    string courseTitle = productTitleNode?.InnerText.Trim() ?? title;
                    
                    string code = "Not specified";
                    string duration = "Not specified";
                    
                    // Look for meta rows containing Code and Duration
                    var metaRows = doc.DocumentNode.SelectNodes("//div[contains(@class, 'meta-row')]|//p[contains(@class, 'meta-row')]|//*[contains(@class, 'meta-row')]");
                    if (metaRows != null)
                    {
                        foreach (var row in metaRows)
                        {
                            var label = row.SelectSingleNode(".//*[contains(@class, 'meta-label')]")?.InnerText.Trim();
                            var val = row.SelectSingleNode(".//*[contains(@class, 'meta-value')]")?.InnerText.Trim();
                            if (label != null && val != null)
                            {
                                if (label.Contains("Code", StringComparison.OrdinalIgnoreCase)) code = val;
                                if (label.Contains("Duration", StringComparison.OrdinalIgnoreCase)) duration = val;
                            }
                        }
                    }
                    else
                    {
                        // Fallback string search
                        var codeNode = doc.DocumentNode.SelectNodes("//*[contains(text(), 'Code:')]")?.FirstOrDefault();
                        if (codeNode?.NextSibling != null) code = HtmlEntity.DeEntitize(codeNode.NextSibling.InnerText).Trim();
                        
                        var durNode = doc.DocumentNode.SelectNodes("//*[contains(text(), 'Duration:')]")?.FirstOrDefault();
                        if (durNode?.NextSibling != null) duration = HtmlEntity.DeEntitize(durNode.NextSibling.InnerText).Trim();
                    }
                    
                    sb.AppendLine($"Course Title: {courseTitle}");
                    sb.AppendLine($"Course Code: {code}");
                    sb.AppendLine($"Duration: {duration}");
                    sb.AppendLine($"URL: {url}");
                    sb.AppendLine();
                    
                    var tabPanels = doc.DocumentNode.SelectNodes("//div[contains(@class, 'woocommerce-Tabs-panel')]");
                    if (tabPanels != null)
                    {
                        foreach (var panel in tabPanels)
                        {
                            string tabId = panel.GetAttributeValue("id", "");
                            string tabName = tabId.Replace("tab-", "").Replace("_", " ").ToUpper();
                            if (string.IsNullOrWhiteSpace(tabName)) tabName = "COURSE DETAILS";
                            
                            sb.AppendLine($"--- {tabName} ---");
                            
                            var scripts = panel.SelectNodes(".//script|.//style");
                            if (scripts != null) foreach (var s in scripts) s.Remove();
                            
                            sb.AppendLine(CleanHtmlText(panel, doc));
                            sb.AppendLine();
                        }
                    }
                    else
                    {
                        // Fallback if no tabs found
                        var mainNode = doc.DocumentNode.SelectSingleNode("//main") ?? doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'entry-content')]");
                        if (mainNode != null)
                        {
                            sb.AppendLine("--- COURSE DETAILS ---");
                            sb.AppendLine(CleanHtmlText(mainNode, doc));
                        }
                    }
                    
                    textContent = sb.ToString().Trim();
                }
                else
                {
                    // General Page Strategy
                    var mainNode = doc.DocumentNode.SelectSingleNode("//main") 
                                ?? doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'entry-content')]")
                                ?? doc.DocumentNode.SelectSingleNode("//body")
                                ?? doc.DocumentNode;
                    
                    var nodesToRemove = mainNode.SelectNodes(".//script|.//style|.//nav|.//footer|.//header|.//noscript|.//svg|.//button|.//aside");
                    if (nodesToRemove != null)
                    {
                        foreach (var node in nodesToRemove) node.Remove();
                    }
                    
                    textContent = CleanHtmlText(mainNode, doc);
                }

                if (!string.IsNullOrWhiteSpace(textContent) && textContent.Length > 150)
                {
                    textContent = FilterUnnecessaryText(textContent);
                    // Categorise Data
                    string label = isCoursePage ? "Course Relevant Information" : "General Information";

                    if (isCoursePage) report.CoursePagesCount++;
                    else report.GeneralPagesCount++;

                    // Calculate Confidence Score
                    double confidence = 0;
                    if (isCoursePage)
                    {
                        confidence = 90.0;
                        if (textContent.Contains("Duration", StringComparison.OrdinalIgnoreCase)) confidence += 5;
                        if (textContent.Contains("Synopsis", StringComparison.OrdinalIgnoreCase) || textContent.Contains("Objective", StringComparison.OrdinalIgnoreCase)) confidence += 5;
                    }
                    else
                    {
                        confidence = 80.0;
                        if (textContent.Length > 500) confidence += 10;
                        else if (textContent.Length > 200) confidence += 5;
                    }
                    totalConfidence += confidence;

                    var existing = await _db.WebPages.FirstOrDefaultAsync(w => w.Url == url);
                    if (existing != null)
                    {
                        // Cross-check to see if anything actually changed
                        if (existing.TextContent != textContent || existing.Title != title || existing.Label != label)
                        {
                            existing.Title = title;
                            existing.TextContent = textContent;
                            existing.Status = "Pending"; // Require review again because content changed
                            existing.Label = label;
                        }
                        
                        // Always update timestamp so we know it's still alive
                        existing.LastScraped = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                    }
                    else
                    {
                        _db.WebPages.Add(new WebPageContent
                        {
                            Id = Guid.NewGuid().ToString(),
                            Url = url,
                            Title = title,
                            TextContent = textContent,
                            Status = "Pending",
                            LastScraped = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                            Label = label
                        });
                    }
                    pagesScraped++;
                }

                // Add discovered links to the queue
                foreach (var cleanUrl in discoveredLinks)
                {
                    if (!visitedUrls.Contains(cleanUrl) && !queuedUrls.Contains(cleanUrl))
                    {
                        int priority = 2; // Default priority
                        if (cleanUrl.Contains("/product/", StringComparison.OrdinalIgnoreCase))
                        {
                            priority = 0; // High priority for courses
                        }
                        
                        urlsToVisit.Enqueue(cleanUrl, priority);
                        queuedUrls.Add(cleanUrl);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error crawling {url}: {ex.Message}");
                report.Errors.Add($"Error on {url}: {ex.Message}");
            }

            // Be polite to the server
            await Task.Delay(500);
        }

        await _db.SaveChangesAsync();

        report.PagesScraped = pagesScraped;
        if (pagesScraped > 0)
        {
            report.OverallConfidence = Math.Round(totalConfidence / pagesScraped, 1);
        }
        
        return report;
    }

    private string CleanHtmlText(HtmlNode rootNode, HtmlDocument doc)
    {
        var cellNodes = rootNode.SelectNodes(".//td|.//th");
        if (cellNodes != null)
        {
            foreach (var node in cellNodes)
            {
                node.AppendChild(doc.CreateTextNode(" | "));
            }
        }

        var blockNodes = rootNode.SelectNodes(".//p|.//div|.//li|.//h1|.//h2|.//h3|.//h4|.//h5|.//h6|.//tr|.//br");
        if (blockNodes != null)
        {
            foreach (var node in blockNodes)
            {
                if (node.Name == "br")
                {
                    node.ParentNode?.InsertAfter(doc.CreateTextNode("\n"), node);
                }
                else
                {
                    node.AppendChild(doc.CreateTextNode("\n\n"));
                }
            }
        }

        var textContent = HtmlEntity.DeEntitize(rootNode.InnerText);
        textContent = textContent.Replace("\u00A0", " ");
        textContent = Regex.Replace(textContent, @"[ \t]+", " ");
        textContent = Regex.Replace(textContent, @"(?:\s*\n\s*){2,}", "\n\n");
        return textContent.Trim();
    }

    private string FilterUnnecessaryText(string text)
    {
        var lines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        var sb = new System.Text.StringBuilder();
        
        string[] badPhrases = new[] {
            "Skip to content", "Read More", "Click Here", 
            "Share on Facebook", "Share on Twitter", "Share on LinkedIn",
            "Search for:", "Leave a reply", "Recent Posts",
            "Next Post", "Previous Post", "Menu", "Home", "About Us", "Contact Us"
        };

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed)) continue;
            
            bool isBad = false;
            foreach (var phrase in badPhrases)
            {
                if (trimmed.Equals(phrase, StringComparison.OrdinalIgnoreCase))
                {
                    isBad = true;
                    break;
                }
            }
            
            if (trimmed.StartsWith("Copyright ©", StringComparison.OrdinalIgnoreCase)) isBad = true;
            
            if (!isBad)
            {
                sb.AppendLine(trimmed);
            }
        }
        
        // Collapse multiple newlines into double newlines
        var result = Regex.Replace(sb.ToString(), @"(?:\s*\n\s*){2,}", "\n\n");
        return result.Trim();
    }
}
