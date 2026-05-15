import React from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course } from '../../types';

interface CourseEditorProps {
  course: Partial<Course> | null;
  isUpdate?: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (course: Partial<Course>) => void;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({ course, isUpdate, onClose, onSave, onChange }) => {
  return (
    <AnimatePresence>
      {course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-white">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{isUpdate ? 'Edit Course' : 'New Course'}</h2>
                <p className="text-xs text-zinc-500 font-medium">Define the technical details for this program.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="course-id" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Course ID</label>
                  <input
                    id="course-id"
                    type="text"
                    placeholder="e.g. WSQ-001"
                    value={course.id || ''}
                    disabled={isUpdate}
                    onChange={e => onChange({ ...course, id: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="course-category" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Category</label>
                  <select
                    id="course-category"
                    value={course.category || 'WSQ'}
                    onChange={e => onChange({ ...course, category: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                  >
                    <option value="WSQ">WSQ Courses</option>
                    <option value="AI & Digital">AI & Digital</option>
                    <option value="IPC">IPC Specialist</option>
                    <option value="Foreign Workers">Foreign Workers</option>
                    <option value="Skills Improvement">Skills Improvement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="course-title" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Full Course Title</label>
                <input
                  id="course-title"
                  type="text"
                  value={course.title || ''}
                  onChange={e => onChange({ ...course, title: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="course-description" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Marketing Description</label>
                <textarea
                  id="course-description"
                  rows={4}
                  value={course.description || ''}
                  onChange={e => onChange({ ...course, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="course-duration" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Duration</label>
                  <input
                    id="course-duration"
                    type="text"
                    value={course.duration || ''}
                    onChange={e => onChange({ ...course, duration: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="course-level" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Skill Level</label>
                  <select
                    id="course-level"
                    value={course.level || 'Intermediate'}
                    onChange={e => onChange({ ...course, level: e.target.value as any })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="course-url" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Official Website URL</label>
                <input
                  id="course-url"
                  type="url"
                  value={course.url || ''}
                  onChange={e => onChange({ ...course, url: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="course-objectives" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Course Objectives (comma separated)</label>
                <textarea
                  id="course-objectives"
                  rows={3}
                  value={course.objectives?.join(', ') || ''}
                  onChange={e => onChange({ ...course, objectives: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none"
                  placeholder="e.g. Master soldering skills, Understand IPC standards"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="course-audience" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Target Audience (comma separated)</label>
                <textarea
                  id="course-audience"
                  rows={3}
                  value={course.targetAudience?.join(', ') || ''}
                  onChange={e => onChange({ ...course, targetAudience: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none"
                  placeholder="e.g. Technicians, Engineers, Quality Control staff"
                />
              </div>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-elitc-gold/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
