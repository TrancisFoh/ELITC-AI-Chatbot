using System.Collections.Generic;

namespace ELITC_AI_Chatbot.Models
{
    public class CrawlProgress
    {
        public int TotalDiscovered { get; set; }
        public int Processed { get; set; }
        public string CurrentUrl { get; set; } = string.Empty;
    }

    public class CrawlReport
    {
        public int PagesScraped { get; set; }
        public double OverallConfidence { get; set; }
        public int CoursePagesCount { get; set; }
        public int GeneralPagesCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
