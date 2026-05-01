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
    <div id="course-carousel-root" className="relative group/carousel">
      <motion.div 
        ref={scrollRef}
        id="course-slides-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {courses.map((course, idx) => (
          <div 
            key={course.id}
            id={`course-card-${idx}`}
            className="min-w-[200px] max-w-[200px] bg-white border border-zinc-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden snap-center group"
          >
            {/* Header with Title */}
            <div 
              className="bg-elitc-gold p-5 flex items-center justify-center min-h-[110px] text-center"
              id={`card-header-${idx}`}
            >
              <h3 className="font-bold text-[13px] leading-tight text-zinc-900 group-hover:scale-105 transition-transform duration-300">
                {course.title}
              </h3>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-3" id={`card-content-${idx}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-elitc-gold/80"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  </div>
                  <span>Code: <span className="text-zinc-900 font-bold ml-1">{course.id}</span></span>
                </div>
                
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-elitc-gold/80" />
                  </div>
                  <span>Duration: <span className="text-zinc-900 font-bold ml-1">{course.duration}</span></span>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="border-t border-dashed border-zinc-200 my-0.5" />

              {/* Action Link */}
              <a 
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-elitc-gold-dark font-bold text-[12px] hover:translate-x-1 transition-transform"
                id={`card-link-${idx}`}
              >
                View Course
                <ChevronRight className="w-3.5 h-3.5" />
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
