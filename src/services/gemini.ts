import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const DEFAULT_SYSTEM_INSTRUCTION = `
You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre (https://www.elitc.com/).

Primary Objective:
Your mission is to provide helpful information about ELITC's services, courses, and facilities. While you aim to help users discover training that benefits their career or company, always address their specific questions first (location, contact, etc.) before pivoting to consultation. You are a professional and helpful guide for the Electronics Industries Training Centre.

Consultative Approach:
1. Be Inquisitive: If a user's request is broad (e.g., "I want to learn AI"), you MUST ask follow-up questions before giving a final recommendation. Ask about their current role, their technical background, and what they hope to achieve (e.g., career switch, upskilling for current job, or personal interest).
2. Personalize Recommendations: Once you have information, explain exactly *why* a specific course (like WSQ or IPC) is the best fit for their specific situation.
3. Keep responses concise but warm (max 3-4 sentences).
4. ALWAYS end with a helpful follow-up question that helps narrow down their needs or moves them closer to a decision.

Proactive Behavior:
- If they are an individual, ask about their career aspirations or current industry.
- If they are a company representative, ask about their team's current challenges or the specific skills they want to uplift.
- You can "trigger" course displays by mentioning specific categories like "WSQ Courses", "AI & Digital", "IPC Training", "Foreign Workers", or "Skills Improvement".

Key Info:
- Training for SMEs/MNCs.
- Location: Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870
- Contact: +65 6483 2535| enquiry@elitc.com
- Free consultation available for Workforce Skills Qualifications (WSQ) roadmaps.

Course Categories:
- Workforce Skills Qualifications (WSQ) Courses
- Work Skills Improvement (WSI) Courses
- IPC Certification Training/Workshop
- AI and Digital Transformation Courses
- Foreign Workers Courses

Response Style:
- Professional, encouraging, and consultative.
- Use Markdown for bolding key terms.
- Use emojis to feel approachable (👋, 📚, 🚀, 🎯).
`;

/**
 * Logic to communicate with the Gemini AI model.
 * Handles conversation history, system instructions, and streaming responses.
 */
export async function chatWithAI(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  systemInstruction?: string,
  onChunk?: (text: string) => void
): Promise<{ content: string; isError: boolean }> {
  try {
    // Initialize a new chat session with the full conversation context
    const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",

      history: history.map(h => ({ role: h.role, parts: h.parts })),
      config: {
        systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // Add a race against a timeout to handle connection hangs
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), 20000)
    );

    // Check if we should stream the response (real-time typing effect) or wait for full reply
    if (onChunk) {
      const result = await Promise.race([
        chat.sendMessageStream({ message }),
        timeoutPromise
      ]) as any;

      let fullText = "";
      for await (const chunk of result) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        onChunk(fullText);
      }
      return { content: fullText, isError: false };
    } else {
      const result = await Promise.race([
        chat.sendMessage({ message }),
        timeoutPromise
      ]) as any;
      return { content: result.text || "I'm sorry, I couldn't process that request.", isError: false };
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide user-friendly errors based on common failure modes (Quota, Safety Filters, etc.)
    const errorMessage = error?.message?.toLowerCase() || "";
    let content = "I'm having a small technical hiccup. 💫 Could you please try sending that again? I'm eager to help you find the right course!";

    if (errorMessage.includes("timed out")) {
      content = "It's taking a bit longer than usual to connect to my brain! 🧠 Please try again in a moment – I'm still here to help.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      content = "I've been helping so many people today that I'm a bit out of breath! 😅 Please wait a moment before asking another question, or try again later.";
    } else if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
      content = "I'm sorry, I can only discuss topics related to ELITC's training, courses, and professional development. Let's get back to your learning journey! 📚";
    } else if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("connection")) {
      content = "It seems I've lost my connection to the training center! 📡 Please check your internet and try again so we can continue your consultation.";
    }
    
    return { content, isError: true };
  }
}
