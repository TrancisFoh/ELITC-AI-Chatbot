/**
 * Represents a training course offered by ELITC.
 */
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

/**
 * Represents a single message in the chat history.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  courses?: Course[]; // Optional array of courses to display as a carousel
  isComplete?: boolean; // Flag to indicate if AI streaming response has finished
  isError?: boolean; // Flag to indicate if the message represents an error
}
