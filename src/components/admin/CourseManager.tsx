import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Course } from '../../types';

interface CourseManagerProps {
  courses: Course[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  courses,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onAdd
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-elitc-gold/20 focus:border-elitc-gold transition-all w-full"
          />
        </div>
        <button
          onClick={onAdd}
          className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-elitc-gold/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Course Title</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {courses
                .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">{course.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-zinc-400 line-clamp-1">{course.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        course.category === 'WSQ' ? 'bg-blue-50 text-blue-600' :
                        course.category === 'AI & Digital' ? 'bg-purple-50 text-purple-600' :
                        course.category === 'IPC' ? 'bg-amber-50 text-amber-600' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-600">{course.level}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(course)}
                          className="p-2 text-zinc-400 hover:text-elitc-gold hover:bg-elitc-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(course.id)}
                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
