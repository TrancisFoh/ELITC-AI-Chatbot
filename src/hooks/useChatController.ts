import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Course } from '../types';
import { chatWithAI } from '../services/gemini';
import { ELITC_COURSES, CATEGORY_MAP } from '../data/courses';
import { dbService } from '../services/db';
import {
  predefinedResponses,
  getCategoryResponse,
  getContextualReplies,
  getSuggestedFollowUps,
  detectCategory
} from '../services/messageHandler';
import { retrieveCourses } from '../services/rag';

/**
 * Primary custom hook to manage the chat operations.
 */
export function useChatController() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [systemInstruction, setSystemInstruction] = useState<string | undefined>(undefined);

  const [sessionId] = useState(() => {
    const saved = sessionStorage.getItem('elitc_chat_session_id');
    if (saved) return saved;
    const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('elitc_chat_session_id', newId);
    return newId;
  });

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
    const unsubCourses = dbService.subscribeToCourses((courses) => {
      setDbCourses(courses.length > 0 ? courses : ELITC_COURSES);
    });

    const unsubConfig = dbService.subscribeToSystemInstruction((instruction) => {
      setSystemInstruction(instruction);
    });

    return () => {
      unsubCourses();
      unsubConfig();
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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
    dbService.saveChatLog({ session_id: sessionId, role: 'user', content: messageText });

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

    // --- PRE-MADE RESPONSES ---
    if (predefinedResponses[messageText]) {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const responseData = predefinedResponses[messageText](dbCourses);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseData.content || '',
          timestamp: Date.now(),
          isComplete: true,
          ...responseData
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(responseData.suggestedReplies);
        setIsLoading(false);
        setConnectionStatus('connected');
        dbService.saveChatLog({ session_id: sessionId, role: 'assistant', content: responseData.content || '' });
      }, 400);
      return;
    }

    if (CATEGORY_MAP[messageText]) {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        const category = CATEGORY_MAP[messageText];
        const responseData = getCategoryResponse(category, dbCourses);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseData.content || '',
          timestamp: Date.now(),
          isComplete: true,
          ...responseData
        };
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestedReplies(responseData.suggestedReplies);
        setIsLoading(false);
        setConnectionStatus('connected');
        dbService.saveChatLog({ session_id: sessionId, role: 'assistant', content: responseData.content || '' });
      }, 400);
      return;
    }

    // --- AI GENERATED RESPONSE FALLBACK ---
    setIsLoading(true);
    setConnectionStatus('connecting');
    setSuggestedReplies([]);

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setConnectionStatus('error');
        setIsLoading(false);
      }
    }, 25000);

    try {
      // Perform client-side RAG search
      const matchedCourses = retrieveCourses(messageText, dbCourses, 4);
      let dynamicInstruction = systemInstruction;

      if (matchedCourses.length > 0) {
        const courseContext = matchedCourses.map(c => `
- Course Code/ID: ${c.id}
  Title: ${c.title}
  Category: ${c.category}
  Duration: ${c.duration}
  Synopsis: ${c.synopsis || 'N/A'}
  Target Audience: ${c.targetAudience?.join(', ') || 'N/A'}
  URL: ${c.url || 'N/A'}
`).join('\n');

        const baseInstruction = systemInstruction || `You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre.`;
        dynamicInstruction = `${baseInstruction.trim()}\n\n[RELEVANT COURSE CATALOG INFORMATION]\nThe user is asking about or might benefit from the following specific courses in our catalog. Use this verified data to answer accurately (including course codes, duration, target audience, and URLs if asked):\n${courseContext}\nDo NOT hallucinate or guess any course details not provided here.`;
      }

      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const assistantMessageId = (Date.now() + 1).toString();
      let hasAddedAssistant = false;

      const { content: aiResponse, isError } = await chatWithAI(messageText, history, dynamicInstruction, (chunk) => {
        clearTimeout(timeoutId);
        
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
      }, sessionId);

      clearTimeout(timeoutId);

      // Finalize message
      let carouselCourses: Course[] | undefined = matchedCourses.length > 0 ? matchedCourses : undefined;
      if (!carouselCourses) {
        const mentionedCategoryKey = detectCategory(aiResponse);
        if (mentionedCategoryKey) {
          const category = CATEGORY_MAP[mentionedCategoryKey];
          carouselCourses = dbCourses.filter(c => c.category === category);
        }
      }

      setMessages(prev => {
        const assistantExists = prev.some(m => m.id === assistantMessageId);
        const finalizedMsg = {
          id: assistantMessageId,
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
          isComplete: true,
          isError,
          courses: carouselCourses
        } as Message;

        if (!assistantExists) {
          return [...prev, finalizedMsg];
        }
        return prev.map(m => m.id === assistantMessageId ? finalizedMsg : m);
      });

      dbService.saveChatLog({ session_id: sessionId, role: 'assistant', content: aiResponse });
      
      const followUps = getSuggestedFollowUps(aiResponse, isError);
      const contextual = getContextualReplies(aiResponse);
      setSuggestedReplies(Array.from(new Set([...followUps, ...contextual])));
    } catch (error) {
      console.error("Chat Error:", error);
      setConnectionStatus('error');
      
      // Log the error to our SQLite database
      dbService.saveErrorLog({
        session_id: sessionId,
        error_message: error instanceof Error ? error.message : String(error),
        stack_trace: error instanceof Error ? error.stack : undefined,
        component: "useChatController.handleSend"
      });
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
    handleScroll
  };
}
