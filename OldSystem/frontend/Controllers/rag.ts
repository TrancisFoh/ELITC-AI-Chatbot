import { Course } from '../types';

// Common words to filter out before searching
const STOP_WORDS = new Set([
  'i', 'want', 'to', 'learn', 'course', 'courses', 'in', 'a', 'the', 'for', 'about', 
  'please', 'me', 'show', 'tell', 'what', 'is', 'are', 'any', 'you', 'have', 'do', 
  'we', 'need', 'how', 'can', 'find', 'search', 'get', 'with', 'on', 'at'
]);

/**
 * Searches the list of courses using key tokens from the user's query and returns
 * the top matching courses ranked by relevance score.
 */
export function retrieveCourses(query: string, courses: Course[], limit: number = 3): Course[] {
  const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/g, '');
  const tokens = normalizedQuery.split(/\s+/).filter(token => token.length > 1 && !STOP_WORDS.has(token));

  if (tokens.length === 0) return [];

  const scoredCourses = courses.map(course => {
    let score = 0;
    
    // Check exact ID match (highest priority, e.g. "5S", "AMT")
    if (course.id.toLowerCase() === normalizedQuery.trim()) {
      score += 30;
    }

    const titleLower = course.title.toLowerCase();
    const synopsisLower = (course.synopsis || '').toLowerCase();
    const categoryLower = course.category.toLowerCase();
    const audienceStr = (course.targetAudience || []).join(' ').toLowerCase();

    // Check token-based matches
    tokens.forEach(token => {
      // Title matches have high weight
      if (titleLower.includes(token)) {
        score += 8;
        // Exact word match in title gets bonus
        const wordRegex = new RegExp(`\\b${token}\\b`, 'i');
        if (wordRegex.test(titleLower)) score += 4;
      }
      
      // Category matches
      if (categoryLower.includes(token)) {
        score += 5;
      }

      // Synopsis matches
      if (synopsisLower.includes(token)) {
        score += 3;
      }

      // Target audience matches
      if (audienceStr.includes(token)) {
        score += 1;
      }
    });

    return { course, score };
  });

  // Filter out non-matching and sort by highest score
  return scoredCourses
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.course)
    .slice(0, limit);
}
