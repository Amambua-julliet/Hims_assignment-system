import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Clock,
  Loader2,
  Users,
  X,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { onAuthStateChanged } from 'firebase/auth';

const LecturerCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCourseRoster, setSelectedCourseRoster] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<UserProfile[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [searchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const lecturerCourses = await courseService.getCoursesByLecturer(user.uid);
          setCourses(lecturerCourses);
        } catch (err: any) {
          console.error('Error fetching lecturer data:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleViewRoster = async (course: Course) => {
    setSelectedCourseRoster(course);
    setIsLoadingRoster(true);
    try {
      const students = await userService.getStudentsByCourse(course.id);
      setCourseStudents(students);
    } catch (err: any) {
      console.error('Failed to load roster', err);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const filteredCourses = courses.filter((course: Course) => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synchronizing Courses...</p>
        </div>
      )}

      {/* Roster Modal */}
      {selectedCourseRoster && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-10 font-outfit">
             <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               {/* Modal Header */}
               <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32 blur-3xl"></div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                     <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-white/20 shadow-sm">{selectedCourseRoster.code}</span>
                     <span className="bg-emerald-500/20 text-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-500/30">Active Roster</span>
                   </div>
                   <h2 className="text-[28px] font-extrabold tracking-tight">{selectedCourseRoster.name}</h2>
                   <p className="text-blue-100 font-medium text-sm mt-1">{selectedCourseRoster.level} • {selectedCourseRoster.department}</p>
                 </div>
                 <button 
                  onClick={() => setSelectedCourseRoster(null)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors relative z-10"
                 >
                   <X size={20} />
                 </button>
               </div>

               {/* Roster List */}
               <div className="p-8 overflow-y-auto bg-slate-50 flex-1">
                 {isLoadingRoster ? (
                   <div className="flex justify-center items-center py-20 text-slate-400">
                     <Loader2 className="animate-spin" size={32} />
                   </div>
                 ) : (
                   <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                     {courseStudents.length === 0 ? (
                       <div className="text-center py-20 px-8">
                         <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Users size={32} />
                         </div>
                         <p className="text-slate-900 font-extrabold text-lg">No Students Registered</p>
                         <p className="text-slate-400 text-sm mt-1">Students will appear here once they enroll in this course.</p>
                       </div>
                     ) : (
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="border-b border-slate-50 bg-[#fafafa]/50">
                             <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">STUDENT NAME</th>
                             <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">MATRICULE</th>
                             <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">EMAIL</th>
                             <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">ENROLLED</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                           {courseStudents.map((student: UserProfile) => (
                             <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                               <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                   <img 
                                      src={`https://ui-avatars.com/api/?name=${student.name}&background=0f172a&color=fff`} 
                                      className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" 
                                      alt="avatar" 
                                   />
                                   <div>
                                     <p className="text-[14px] font-extrabold text-slate-800">{student.name}</p>
                                     <p className="text-[11px] font-bold text-slate-400 mt-0.5">{student.level}</p>
                                   </div>
                                 </div>
                               </td>
                               <td className="px-8 py-5">
                                 <span className="font-mono text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50 block w-max">
                                   {student.matricule || 'PENDING'}
                                 </span>
                               </td>
                               <td className="px-8 py-5">
                                 <p className="text-[13px] font-semibold text-slate-600">{student.email}</p>
                               </td>
                               <td className="px-8 py-5 text-slate-400">
                                 <CalendarDays size={18} />
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     )}
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}

      <div>
        <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight">Assigned Modules</h1>
        <p className="text-[15px] font-medium text-slate-500 mt-2">Manage your assigned courses and view class rosters.</p>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length === 0 && !isLoading && (
              <div className="col-span-full bg-white p-16 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Courses Found</p>
                <p className="text-sm text-slate-500 mt-2">Try adjusting your search query or wait for assignments.</p>
              </div>
            )}

            {filteredCourses.map((course: Course) => (
               <div key={course.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="p-6 pb-4 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full translate-x-8 -translate-y-8"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="bg-white text-slate-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 shadow-sm">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</span>
                    </div>
                    <h3 className="text-[18px] font-extrabold text-slate-900 leading-tight mb-2 relative z-10">{course.name}</h3>
                    <p className="text-[12px] font-semibold text-slate-400 relative z-10 flex items-center gap-1.5">
                       <Clock size={12} className="text-slate-300" />
                       {course.semester} Semester • {course.credits} Credits
                    </p>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto border-t border-slate-50 flex gap-3 bg-white relative z-10">
                    <button 
                      onClick={() => handleViewRoster(course)}
                      className="flex-1 py-3.5 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors text-blue-600 rounded-xl text-sm font-bold shadow-sm mt-4 flex items-center justify-center gap-2 group/btn"
                    >
                      <Users size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Class Roster
                    </button>
                    <button 
                      onClick={() => navigate('/lecturer-assignments')}
                      className="w-[52px] h-[52px] bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-slate-500 rounded-xl flex items-center justify-center mt-4 shrink-0"
                      title="Manage Assignments"
                    >
                      <FileText size={20} />
                    </button>
                  </div>
               </div>
            ))}
          </div>
        </div>
  );
};

export default LecturerCoursesPage;
