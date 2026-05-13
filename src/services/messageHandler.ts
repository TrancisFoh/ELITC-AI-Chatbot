import { Message, Course } from '../types';
import { CATEGORY_MAP } from '../data/courses';

export const predefinedResponses: Record<string, (courses: Course[]) => Partial<Message> & { suggestedReplies: string[] }> = {
  "For Myself": () => ({
    content: "That's great! Investing in yourself is always a good idea. 🚀\n\nAre you looking to **improve your current skills**, or are you considering a **career transition**? We have many WSQ courses that can help you with both!",
    suggestedReplies: ["WSQ Courses", "AI & Digital", "Skills Improvement", "Contact Us"]
  }),
  "For my Company": () => ({
    content: "ELITC provides comprehensive training solutions for businesses! 🏢\n\nWe specialize in **Corporate Training**, **Foreign Worker Training**, and **Skills Future** initiatives. Would you like to see our courses or speak with a consultant about your group's needs?",
    suggestedReplies: ["Foreign Workers", "WSQ Courses", "Contact Us", "Office Location"]
  }),
  "View Courses": (courses) => ({
    content: "Here is our full course catalog. You can filter by category or level below!",
    courses,
    suggestedReplies: ["WSQ Courses", "AI & Digital", "Contact Us", "Office Location"]
  }),
  "View All Courses": (courses) => ({
    content: "Here is our full course catalog. You can filter by category or level below!",
    courses,
    suggestedReplies: ["WSQ Courses", "AI & Digital", "Contact Us", "Office Location"]
  }),
  "Contact Us": () => ({
    content: "You can reach us at **+65 6483 2535** or email us at **enquiry@elitc.com**. Feel free to drop by for a chat!",
    suggestedReplies: ["View Courses", "Office Location"]
  }),
  "Office Location": () => ({
    content: "We are located at:\n**Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870**.\n\nWe look forward to seeing you!",
    location: {
      lat: 1.374526,
      lng: 103.856515,
      address: "Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870",
      mapUrl: "https://maps.google.com/maps?q=ELITC+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    suggestedReplies: ["View Courses", "Contact Us"]
  })
};

export function getCategoryResponse(category: string, allCourses: Course[]): Partial<Message> & { suggestedReplies: string[] } {
  const courses = allCourses.filter(c => c.category === category);
  let description = `Here are our **${category}** courses. These programs are designed to help you stay ahead in the industry.`;

  if (category === "WSQ") {
    description = "Our **WSQ (Workforce Skills Qualifications)** courses are nationally recognized and highly practical. They are designed to equip you with the exact competencies required by the manufacturing and electronics sectors.";
  } else if (category === "AI & Digital") {
    description = "Stay future-ready with our **AI & Digital** programs. From mastering ChatGPT for productivity to advanced network security, we help you navigate the digital transformation landscape confidently.";
  } else if (category === "IPC") {
    description = "As an Authorised Training Center, we offer world-standard **IPC Certification**. These are essential for professionals in electronics assembly, inspection, and rework.";
  } else if (category === "Foreign Workers") {
    description = "We offer specialized programs for **Foreign Workers**, including Workplace English and skills upgrading to help them achieve R1 status and improve workshop communication.";
  } else if (category === "Skills Improvement") {
    description = "Our **Skills Improvement** suite covers leadership, stress management, and technical fundamentals. Perfect for well-rounded professional development.";
  }

  return {
    content: `${description}\n\nWhich of these would you like to explore?`,
    courses,
    suggestedReplies: ["View All Courses", "Contact Us", "Office Location"]
  };
}

export function getContextualReplies(response: string): string[] {
  const lowerResp = response.toLowerCase();
  const links: string[] = [];
  if (lowerResp.includes('contact') || lowerResp.includes('email') || lowerResp.includes('enquiry')) links.push("Contact Us");
  if (lowerResp.includes('location') || lowerResp.includes('address') || lowerResp.includes('where')) links.push("Office Location");
  return links;
}

export function getSuggestedFollowUps(aiResponse: string, isError: boolean): string[] {
  const responseLower = aiResponse.toLowerCase();
  const baseOptions = ["WSQ Courses", "AI & Digital", "Foreign Workers"];

  if (isError) {
    return ["Contact Us", "Office Location", "View Courses"];
  }

  if (responseLower.includes('consultation')) {
    return ["WSQ Courses", "Skills Improvement", ...baseOptions];
  }

  if (responseLower.includes('ai')) {
    return ["AI & Digital", "IPC Training", ...baseOptions];
  }

  if (responseLower.includes('foreign')) {
    return ["Foreign Workers", "WSQ Courses", ...baseOptions];
  }

  return baseOptions;
}

export function detectCategory(aiResponse: string): string | undefined {
  const isQuestion = aiResponse.trim().endsWith('?');
  const hasRecommendationIntent = /recommend|suggest|here are|check out|look at|available|suitable|catalog|courses for you/i.test(aiResponse);

  if (!hasRecommendationIntent && isQuestion) return undefined;

  return Object.keys(CATEGORY_MAP).find(cat =>
    aiResponse.toLowerCase().includes(cat.toLowerCase()) ||
    aiResponse.toLowerCase().includes(CATEGORY_MAP[cat].toLowerCase())
  );
}
