import { useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { Course } from '../types';

interface CourseCarouselProps {
  courses: Course[];
}

export const CourseCarousel = ({ courses }: CourseCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel">
      <motion.div 
        ref={scrollRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {courses.map(course => (
          <div 
            key={course.id}
            className="min-w-[220px] max-w-[220px] bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex flex-col hover:border-elitc-gold hover:shadow-md transition-all group snap-center"
          >
            <div className="flex justify-between items-start mb-1 gap-2">
              <h3 className="font-bold text-[11px] text-zinc-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
              <span className="text-[8px] px-1 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-bold uppercase shrink-0">{course.category}</span>
            </div>
            <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">{course.description}</p>
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-[9px] text-zinc-400 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-0.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Visit Site</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
              <a 
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 bg-elitc-gold text-zinc-900 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 group-hover:bg-elitc-gold-dark transition-all shadow-sm"
              >
                View Course Details
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </motion.div>
      
      {courses.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-zinc-50"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-zinc-50"
          >
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        </>
      )}
    </div>
  );
};
