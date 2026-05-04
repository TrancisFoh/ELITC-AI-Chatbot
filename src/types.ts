export interface Course {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  url: string;
  category: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  courses?: Course[];
  isComplete?: boolean;
  isError?: boolean;
}
