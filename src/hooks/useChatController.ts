import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Course } from '../types';
import { chatWithAI } from '../services/gemini';
import { ELITC_COURSES, CATEGORY_MAP } from '../data/courses';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

/**
 * Primary custom hook to manage the chat operations.
 * Handles state for message history, loading states, and suggested replies.
 * Integrated with Firebase for real-time course data and dynamic bot instructions.
 */
export function useChatController() {
  // --- STATE DEFINITIONS ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Real-time data from Firestore
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [systemInstruction, setSystemInstruction] = useState<string | undefined>(undefined);

  // These are the "quick-reply" pills shown above the input box
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    "For Myself",
    "For my Company",
    "View Courses",
    "Contact Us"
  ]);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- DATABASE SYNC ---
  useEffect(() => {
    // Sync Courses
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as Course);
      setDbCourses(docs.length > 0 ? docs : ELITC_COURSES); // Use local fallback if DB empty
    });

    // Sync Bot Instructions
    const unsubConfig = onSnapshot(query(collection(db, 'configs'), where('key', '==', 'SYSTEM_INSTRUCTION')), (snapshot) => {
      if (!snapshot.empty) {
        setSystemInstruction(snapshot.docs[0].data().value);
      }
    });

    return () => {
      unsubCourses();
      unsubConfig();
    };
  }, []);

  // Monitors scroll position to handle the "scroll to latest" button visibility
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  // Utility to scroll the chat window to the bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  // Initialize with a welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi there! 👋 I'm the **ELITC Assistant**. How can I help you today?`,
        timestamp: Date.now(),
        isComplete: true
      }]);
    }
  }, [messages.length]);

  // Keep chat scrolled to bottom as messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /**
   * Core function to handle sending messages.
   * Processes pre-made responses for specific buttons/keywords first,
   * then falls back to the Gemini AI for anything else.
   */
  const handleSend = async (text?: string) => {
    const messageText = (typeof text === 'string' ? text : input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // --- ADMIN COMMANDS ---
    if (messageText.toLowerCase() === "/admin") {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Redirecting to Admin Panel... 🚀",
        timestamp: Date.now(),
        isComplete: true
      }]);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
      return;
    }

    // Helper to inject specific ELITC links based on keyword detection
    const getContextualReplies = (response: string) => {
      const lowerResp = response.toLowerCase();
      const links: string[] = [];
      if (lowerResp.includes('contact') || lowerResp.includes('email') || lowerResp.includes('enquiry')) links.push("Contact Us");
      if (lowerResp.includes('location') || lowerResp.includes('address') || lowerResp.includes('where')) links.push("Office Location");
      return links;
    };

    // --- PRE-MADE RESPONSES ---
    // Instant replies for specific button clicks to improve performance and control
    if (messageText === "For Myself") {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "That's great! Investing in yourself is always a good idea. 🚀\n\nAre you looking to **improve your current skills**, or are you considering a **career transition**? We have many WSQ courses that can help you with both!",
          timestamp: Date.now(),
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["WSQ Courses", "AI & Digital", "Skills Improvement", "Contact Us"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    if (messageText === "For my Company") {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "ELITC provides comprehensive training solutions for businesses! 🏢\n\nWe specialize in **Corporate Training**, **Foreign Worker Training**, and **Skills Future** initiatives. Would you like to see our courses or speak with a consultant about your group's needs?",
          timestamp: Date.now(),
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["Foreign Workers", "WSQ Courses", "Contact Us", "Office Location"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    if (messageText === "View Courses" || messageText === "View All Courses") {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Here is our full course catalog. You can filter by category or level below!",
          timestamp: Date.now(),
          courses: dbCourses,
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["WSQ Courses", "AI & Digital", "Contact Us", "Office Location"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    if (messageText === "Contact Us") {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "You can reach us at **+65 6483 2535** or email us at **enquiry@elitc.com**. Feel free to drop by for a chat!",
          timestamp: Date.now(),
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["View Courses", "Office Location"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    if (messageText === "Office Location") {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "We are located at:\n**Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870**.\n\nWe look forward to seeing you!",
          timestamp: Date.now(),
          location: {
            lat: 1.374526,
            lng: 103.856515,
            address: "Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870",
            mapUrl: "https://maps.google.com/maps?q=ELITC+Singapore&t=&z=15&ie=UTF8&iwloc=&output=embed"
          },
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["View Courses", "Contact Us"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    if (CATEGORY_MAP[messageText]) {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const category = CATEGORY_MAP[messageText];
        const courses = dbCourses.filter(c => c.category === category);
        
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

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `${description}\n\nWhich of these would you like to explore?`,
          timestamp: Date.now(),
          courses: courses,
          isComplete: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(["View All Courses", "Contact Us", "Office Location"]);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 400);
      return;
    }

    // --- AI GENERATED RESPONSE FALLBACK ---
    // If the input doesn't match any pre-defined rules, we query the AI model
    setIsLoading(true);
    setConnectionStatus('connecting');
    setSuggestedReplies([]);

    try {
      // Map message history to format required by Gemini Chat API
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const assistantMessageId = (Date.now() + 1).toString();
      let hasAddedAssistant = false;

      // Streamed chat with the model
      const { content: aiResponse, isError } = await chatWithAI(messageText, history, systemInstruction, (chunk) => {
        // Handle incoming data chunks for real-time appearance
        if (!hasAddedAssistant && chunk.trim()) {
          hasAddedAssistant = true;
          setIsLoading(false); 
          setConnectionStatus('connected');
          setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: chunk,
            timestamp: Date.now(),
            isComplete: false
          }]);
        } else if (hasAddedAssistant) {
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId ? { ...m, content: chunk } : m
          ));
        }
      });

      // Finalize the assistant message state once the stream ends
      setMessages(prev => {
        const assistantExists = prev.some(m => m.id === assistantMessageId);
        if (!assistantExists) {
          return [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: aiResponse,
            timestamp: Date.now(),
            isComplete: true,
            isError
          }];
        }
        return prev.map(m => 
          m.id === assistantMessageId ? { ...m, content: aiResponse, isComplete: true, isError } : m
        );
      });
      
      // Auto-detect if AI response mentions courses to inject a course carousel
      const isQuestion = aiResponse.trim().endsWith('?');
      const hasRecommendationIntent = /recommend|suggest|here are|check out|look at|available|suitable|catalog|courses for you/i.test(aiResponse);
      
      const mentionedCategory = (hasRecommendationIntent || !isQuestion) && Object.keys(CATEGORY_MAP).find(cat => 
        aiResponse.toLowerCase().includes(cat.toLowerCase()) || 
        aiResponse.toLowerCase().includes(CATEGORY_MAP[cat].toLowerCase())
      );

      if (mentionedCategory) {
        const category = CATEGORY_MAP[mentionedCategory];
        const courses = dbCourses.filter(c => c.category === category);
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId ? { ...m, courses } : m
        ));
      }
                
      // Select appropriate suggested follow-up questions
      const responseLower = aiResponse.toLowerCase();
      const baseOptions = ["WSQ Courses", "AI & Digital", "Foreign Workers"];
      
      let newReplies: string[] = [];
      if (isError) {
        newReplies = ["Contact Us", "Office Location", "View Courses"];
      } else if (responseLower.includes('consultation')) {
        newReplies = ["WSQ Courses", "Skills Improvement", ...baseOptions];
      } else if (responseLower.includes('ai')) {
        newReplies = ["AI & Digital", "IPC Training", ...baseOptions];
      } else if (responseLower.includes('foreign')) {
        newReplies = ["Foreign Workers", "WSQ Courses", ...baseOptions];
      } else {
        newReplies = [...baseOptions];
      }
      
      setSuggestedReplies(Array.from(new Set([...newReplies, ...getContextualReplies(aiResponse)])));
    } catch (error) {
      console.error("Chat Error:", error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! 👋 I'm the **ELITC Assistant**. How can I help you today?`,
      timestamp: Date.now(),
      isComplete: true
    }]);
    setSuggestedReplies(["For Myself", "For my Company", "View Courses", "Contact Us"]);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    connectionStatus,
    isOpen,
    setIsOpen,
    isExpanded,
    setIsExpanded,
    suggestedReplies,
    scrollRef,
    showScrollButton,
    handleSend,
    resetChat,
    scrollToBottom,
  };
}
