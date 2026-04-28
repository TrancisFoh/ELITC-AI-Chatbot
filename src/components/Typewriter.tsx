import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TypewriterProps {
  text: string;
  onComplete?: () => void;
}

export function Typewriter({ text, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete?.();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors" />
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
}
