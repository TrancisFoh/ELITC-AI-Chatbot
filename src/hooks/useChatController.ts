import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';
import { chatWithAI, ELITC_COURSES, CATEGORY_MAP } from '../services/gemini';

export function useChatController() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [isOpen, setIsOpen] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    "For Myself",
    "For my Company",
    "View Courses",
    "Contact Us"
  ]);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  // Initialize welcome message
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

  // Scroll to bottom when messages change or loading state changes
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

    // Helper to get external links if contextually relevant
    const getContextualReplies = (response: string) => {
      const links: string[] = [];
      const lowerResp = response.toLowerCase();
      if (lowerResp.includes('contact') || lowerResp.includes('email') || lowerResp.includes('enquiry')) {
        links.push("Contact Us");
      }
      if (lowerResp.includes('location') || lowerResp.includes('address') || lowerResp.includes('where')) {
        links.push("Office Location");
      }
      return links;
    };

    if (messageText === "View Courses") {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is our full course catalog. You can filter by category or level below!",
        timestamp: Date.now(),
        courses: ELITC_COURSES,
        isComplete: false
      };
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedReplies(["WSQ Courses", "AI & Digital", "Contact Us", "Office Location"]);
      return;
    }

    if (messageText === "Contact Us") {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "You can reach us at **+65 6483 2535** or email us at **enquiry@elitc.com**. Feel free to drop by for a chat!",
        timestamp: Date.now(),
        isComplete: true
      };
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedReplies(["View Courses", "Office Location"]);
      return;
    }

    if (messageText === "Office Location") {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "We are located at: **Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870**. We look forward to seeing you!",
        timestamp: Date.now(),
        isComplete: true
      };
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedReplies(["View Courses", "Contact Us"]);
      return;
    }

    if (CATEGORY_MAP[messageText]) {
      const category = CATEGORY_MAP[messageText];
      const courses = ELITC_COURSES.filter(c => c.category === category);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Here are our **${category}** courses. Which one would you like to know more about?`,
        timestamp: Date.now(),
        courses: courses,
        isComplete: false
      };
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedReplies(["View All Courses", "Contact Us", "Office Location"]);
      return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');
    setSuggestedReplies([]);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const aiResponse = await chatWithAI(messageText, history);
      setConnectionStatus('connected');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        isComplete: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-attach courses if AI mentions a category
      const mentionedCategory = Object.keys(CATEGORY_MAP).find(cat => 
        aiResponse.toLowerCase().includes(cat.toLowerCase()) || 
        aiResponse.toLowerCase().includes(CATEGORY_MAP[cat].toLowerCase())
      );

      if (mentionedCategory) {
        const category = CATEGORY_MAP[mentionedCategory];
        const courses = ELITC_COURSES.filter(c => c.category === category);
        setMessages(prev => prev.map(m => 
          m.id === assistantMessage.id ? { ...m, courses } : m
        ));
      }
                
      // Update suggested replies based on context
      const contextualLinks = getContextualReplies(aiResponse);
      const baseOptions = ["WSQ Courses", "AI & Digital", "Foreign Workers"];
      
      let newReplies: string[] = [];
      if (aiResponse.toLowerCase().includes('consultation')) {
        newReplies = ["WSQ Courses", "Skills Improvement", ...baseOptions, ...contextualLinks];
      } else if (aiResponse.toLowerCase().includes('ai')) {
        newReplies = ["AI & Digital", "IPC Training", ...baseOptions, ...contextualLinks];
      } else if (aiResponse.toLowerCase().includes('foreign')) {
        newReplies = ["Foreign Workers", "WSQ Courses", ...baseOptions, ...contextualLinks];
      } else {
        newReplies = [...baseOptions, ...contextualLinks];
      }
      
      // Ensure unique replies to prevent React key duplication errors
      setSuggestedReplies(Array.from(new Set(newReplies)));
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

  const markMessageComplete = (id: string) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === id);
      if (msg?.isComplete) return prev;
      return prev.map(m => m.id === id ? { ...m, isComplete: true } : m);
    });
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    connectionStatus,
    isOpen,
    setIsOpen,
    suggestedReplies,
    scrollRef,
    showScrollButton,
    handleSend,
    resetChat,
    scrollToBottom,
    markMessageComplete
  };
}
