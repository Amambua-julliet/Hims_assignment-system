import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  Calendar,
  Loader2,
  TrendingUp,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { assignmentService } from '../services/assignmentService';
import type { Assignment, Submission } from '../services/assignmentService';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';

const StudentAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          if (profile) {
            const registeredIds = profile.registeredCourseIds || [];
            
            // Only fetch assignments for explicitly registered courses
            if (registeredIds.length > 0) {
              const fetchedAssignments = await assignmentService.getAssignmentsByCourses(registeredIds);
              setAssignments(fetchedAssignments);
            }

            // Fetch course details for the dropdown filter
            if (profile.department && profile.level) {
              const allDeptCourses = await courseService.getCoursesForStudent(profile.department, profile.level);
              const studentRegisteredCourses = allDeptCourses.filter(c => registeredIds.includes(c.id));
              setCourses(studentRegisteredCourses);
            }

            const fetchedSubmissions = await assignmentService.getSubmissionsByStudent(user.uid);
            setSubmissions(fetchedSubmissions);
          }
        } catch (err) {
          console.error('Error fetching student assignments:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getAssignmentStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignmentId === assignmentId);
    if (!submission) return 'PENDING';
    return submission.status;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'ALL' || assignment.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-orange-100">
            <Clock size={10} strokeWidth={3} />
            Not Submitted
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-blue-100">
            <CheckCircle2 size={10} strokeWidth={3} />
            Submitted
          </span>
        );
      case 'GRADED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-emerald-100">
            <Star size={10} strokeWidth={3} />
            Graded
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-slate-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Syncing Assignments</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Academic Portal</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Level Assignments</h1>
              <p className="text-sm font-medium text-slate-500">Track and manage your module submissions.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 w-64 shadow-sm"
            />
          </div>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[12px] font-extrabold uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer shadow-sm"
          >
            <option value="ALL">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 text-center">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900 text-center">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-2 text-center">Pending</p>
          <p className="text-3xl font-bold text-slate-900 text-center">
            {assignments.filter(a => getAssignmentStatus(a.id) === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 text-center">Submitted</p>
          <p className="text-3xl font-bold text-slate-900 text-center">
            {submissions.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2 text-center">Success Rate</p>
          <p className="text-3xl font-bold text-slate-900 text-center">
            {assignments.length > 0 ? Math.round((submissions.length / assignments.length) * 100) : 100}%
          </p>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Caught Up!</p>
            <p className="text-xs text-slate-300 mt-2">No assignments found matching your filter.</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment.id);
            const course = courses.find(c => c.id === assignment.courseId);
            const isDueSoon = new Date(assignment.dueDate).getTime() - new Date().getTime() < 86400000 * 2; // 2 days

            return (
              <div 
                key={assignment.id}
                onClick={() => status === 'PENDING' && navigate(`/assignments/${assignment.id}`)}
                className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${
                  status === 'PENDING' ? 'cursor-pointer' : 'opacity-80'
                }`}
              >
                {isDueSoon && status === 'PENDING' && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-widest rounded-bl-xl">
                    Urgent
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <BookOpen size={24} />
                  </div>
                  {getStatusBadge(status)}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                      {course?.code || 'GEN'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">•</span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {course?.name || 'General Module'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Due Date</p>
                        <p className="text-[12px] font-bold text-slate-700">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Weighting</p>
                        <p className="text-[12px] font-bold text-slate-700">{assignment.points} Points</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest">
                    {status === 'PENDING' ? 'Start Submission' : 'View Submission'}
                  </span>
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
