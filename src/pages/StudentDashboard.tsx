import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Database,
  Scale,
  Building2,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  MoreHorizontal,
  Loader2,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import type { Assignment, Submission } from '../services/assignmentService';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          if (profile) {
            const registeredIds = profile.registeredCourseIds || [];
            
            // Only fetch assignments for courses the student is EXPLICITLY registered for
            if (registeredIds.length > 0) {
              const fetchedAssignments = await assignmentService.getAssignmentsByCourses(registeredIds);
              setAssignments(fetchedAssignments);
            }

            // Fetch course details for the registered IDs
            if (profile.department && profile.level) {
              const allDeptCourses = await courseService.getCoursesForStudent(profile.department, profile.level);
              const studentRegisteredCourses = allDeptCourses.filter(c => registeredIds.includes(c.id));
              setCourses(studentRegisteredCourses);
            }

            // Fetch user's submissions
            const fetchedSubmissions = await assignmentService.getSubmissionsByStudent(user.uid);
            setSubmissions(fetchedSubmissions);
          }
        } catch (err) {
          console.error("Error fetching student dashboard data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const pendingAssignments = assignments.filter((assignment: Assignment) => 
    !submissions.some((sub: Submission) => sub.assignmentId === assignment.id)
  );

  const completedCount = submissions.length;
  
  // Icon mapping helper
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('design') || title.toLowerCase().includes('database')) return <Database size={20} className="text-blue-600" />;
    if (title.toLowerCase().includes('ethic')) return <Scale size={20} className="text-purple-600" />;
    return <Building2 size={20} className="text-emerald-600" />;
  };

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]">Syncing Student Portal</p>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Student Portal</p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Welcome, {userProfile?.name || 'Student'} 👋 {userProfile?.matricule && <span className="text-xl text-slate-400 font-semibold align-middle ml-2">({userProfile.matricule})</span>}
        </h1>
        <p className="text-[14px] font-medium text-slate-500">You have {pendingAssignments.length} assignments due this week. Stay focused!</p>
      </div>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current GPA</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-slate-900 tracking-tighter">3.6</p>
                  <span className="text-[11px] font-extrabold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    +0.2
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full mt-4 overflow-hidden relative z-10">
                <div className="h-full bg-blue-600 rounded-full w-[72%]"></div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Completed Tasks</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-slate-900 tracking-tighter">{completedCount}</p>
                  <span className="text-[11px] font-bold text-slate-400">Total Submissions</span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-4 relative z-10">
                {submissions.slice(0, 4).map((_: Submission, i: number) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                ))}
                {submissions.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+{submissions.length - 4}</div>
                )}
              </div>
            </div>

            <div className="bg-blue-600 p-7 rounded-[2rem] shadow-xl shadow-blue-200 flex flex-col justify-between h-44 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-3">Pending Assignments</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold tracking-tighter">{pendingAssignments.length.toString().padStart(2, '0')}</p>
                  <span className="text-[11px] font-bold text-blue-100">Action required</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/assignments/all')}
                className="w-full bg-white text-blue-600 font-extrabold py-3 rounded-2xl text-[13px] mt-4 hover:bg-blue-50 transition-colors relative z-10 shadow-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Pending Assignments List */}
            <div className="col-span-8 space-y-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Pending Assignments</h3>
                <Link to="#" className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-widest">See calendar</Link>
              </div>

              <div className="space-y-4">
                {pendingAssignments.length === 0 && !isLoading && (
                  <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Caught Up!</p>
                    <p className="text-xs text-slate-300 mt-2">No pending assignments for your modules.</p>
                  </div>
                )}
                {pendingAssignments.map((assignment: Assignment, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getIcon(assignment.title)}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{assignment.title}</h4>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Points: <span className="text-slate-600">{assignment.points}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-3 py-1 bg-rose-50 text-rose-500 rounded-full uppercase tracking-wider">
                           DUE {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <p className="text-[11px] font-bold text-slate-400 mt-2 italic flex items-center gap-1.5 justify-end">
                          <Clock size={12} />
                          Action Required
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Courses Section */}
            <div className="col-span-4 space-y-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">My Courses</h3>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {courses.map((course: Course, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-blue-50/50 rounded-xl flex items-center justify-center text-blue-500">
                        <BookOpen size={18} />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest leading-none">{course.code}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight mb-4">{course.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Status</span>
                          <span className="text-emerald-500">{course.status}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full bg-blue-500 rounded-full transition-all duration-1000`} style={{ width: `100%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
