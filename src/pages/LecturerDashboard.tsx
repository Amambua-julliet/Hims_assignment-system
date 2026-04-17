import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Megaphone,
  Users,
  ClipboardList,
  Library,
  CheckCircle2,
  MonitorPlay,
  Clock,
  Loader2,
  ChevronRight,
  GraduationCap,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Course } from '../services/courseService';
import { courseService } from '../services/courseService';
import type { Submission } from '../services/assignmentService';
import { assignmentService } from '../services/assignmentService';
import type { UserProfile } from '../services/userService';
import { userService } from '../services/userService';

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsByLevel, setStudentsByLevel] = useState<{ [key: string]: number }>({});
  const [completionRate, setCompletionRate] = useState(0);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('All Levels');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          const lecturerCourses = await courseService.getCoursesByLecturer(user.uid);
          setCourses(lecturerCourses);

          const lecturerSubmissions = await assignmentService.getSubmissionsForLecturer(user.uid);
          setSubmissions(lecturerSubmissions);

          // Dynamic Stats Calculation
          if (lecturerCourses.length > 0) {
            const studentResults = await Promise.all(
              lecturerCourses.map((course: Course) => userService.getStudentsByCourse(course.id))
            );

            // Group students by level
            const levelMap: { [key: string]: Set<string> } = {};
            studentResults.forEach((students: UserProfile[]) => {
              students.forEach((student: UserProfile) => {
                const level = student.level || 'Unknown Level';
                if (!levelMap[level]) levelMap[level] = new Set();
                levelMap[level].add(student.id);
              });
            });

            const levelCounts: { [key: string]: number } = {};
            Object.keys(levelMap).forEach((lvl: string) => {
              levelCounts[lvl] = levelMap[lvl].size;
            });

            setStudentsByLevel(levelCounts);

            if (lecturerSubmissions.length > 0) {
              const gradedCount = lecturerSubmissions.filter((s: Submission) => s.status === 'GRADED').length;
              setCompletionRate(Math.round((gradedCount / lecturerSubmissions.length) * 100));
            } else {
              setCompletionRate(100);
            }
          }
        } catch (err: any) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const pendingReviews = submissions.filter((s: Submission) => s.status === 'PENDING').length;

  const totalStudentsFiltered = selectedLevelFilter === 'All Levels'
    ? Object.values(studentsByLevel).reduce((a, b) => a + b, 0)
    : (studentsByLevel[selectedLevelFilter] || 0);

  const stats = [
    { label: selectedLevelFilter === 'All Levels' ? 'Total Students' : `${selectedLevelFilter} Total`, value: isLoading ? '...' : totalStudentsFiltered.toString(), icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Pending Reviews', value: isLoading ? '...' : pendingReviews.toString(), badge: pendingReviews > 0 ? 'Attention' : 'Clean', badgeColor: pendingReviews > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600', icon: <ClipboardList size={20} className="text-orange-600" />, bg: 'bg-orange-50' },
    { label: 'Active Courses', value: isLoading ? '...' : courses.length.toString(), icon: <Library size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
    { label: 'Grading Progress', value: isLoading ? '...' : `${completionRate}%`, icon: <CheckCircle2 size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synchronizing Console</p>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-1 mb-8">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Faculty Overview</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {userProfile?.name?.split(' ')[0] || 'Lecturer'}!</h1>
      </div>
      {/* Stats Header with Level Filter */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h2 className="text-[28px] font-extrabold text-slate-800 tracking-tight">University Overview</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Real-time student and grading metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="bg-transparent border-none text-[12px] font-extrabold text-slate-700 focus:ring-0 cursor-pointer outline-none min-w-[120px]"
            >
              <option value="All Levels">All Levels</option>
              {Object.keys(studentsByLevel).sort().map((level: string) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              {stat.badge && (
                <span className={`text-[10px] font-extrabold px-3 py-1 bg-opacity-10 rounded-md ${stat.badgeColor}`}>
                  {stat.badge}
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 leading-none">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Level Breakdown Display */}
      {!isLoading && Object.keys(studentsByLevel).length > 0 && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(studentsByLevel).sort().map(([level, count]: [string, number]) => (
            <div key={level} className="bg-white border border-slate-100 rounded-3xl px-8 py-5 shadow-sm flex items-center gap-5 hover:border-blue-100 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{level}</p>
                <p className="text-[20px] font-extrabold text-slate-900 leading-none">{count} Students</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Current Courses */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">Current Courses</h3>
            <a href="#" className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-widest">View all courses</a>
          </div>

          <div className="space-y-4">
            {courses.length === 0 && !isLoading && (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Assigned Courses</p>
                <p className="text-xs text-slate-300 mt-2">Contact the admin to register courses under your profile.</p>
              </div>
            )}
            {courses.map((course: Course, idx: number) => {
              const courseSubmissions = submissions.filter((s: Submission) => s.status === 'PENDING'); // Ideally filtered by assignment -> course
              const pendingCount = courseSubmissions.length; // Simplified for now

              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-50/50 border border-blue-50 rounded-xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <MonitorPlay size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-tight">{course.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">{course.code} • {course.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-bold text-orange-500 flex items-center gap-1.5 justify-end">
                        <Clock size={12} />
                        {pendingCount} Pending
                      </p>
                      <p className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest mt-1">Reviews</p>
                    </div>
                    <span className={`px-4 py-1.5 ${course.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} text-[10px] font-extrabold rounded-full uppercase tracking-wider`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Quick Actions & Notice */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[14px] font-extrabold text-slate-900 mb-5">Quick Actions</h3>
            <div className="space-y-3.5">
              <button className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-sm">
                <Megaphone size={16} />
                Post Announcement
              </button>
              <button
                onClick={() => navigate('/lecturer-assignments')}
                className="w-full flex items-center justify-center gap-2.5 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
              >
                <FileText size={16} />
                Create Assignment
              </button>
            </div>
            <div className="mt-6 text-center">
              <a href="#" className="text-[11px] font-extrabold text-slate-400 hover:text-blue-600 transition-colors">Manage Course Materials</a>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm mt-6">
            <h3 className="text-[14px] font-extrabold text-slate-900 mb-5">Recent Submissions</h3>
            <div className="space-y-4">
              {submissions.filter((s: Submission) => s.status === 'PENDING').slice(0, 5).map((sub: Submission) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/lecturer-grading/${sub.id}`)}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {sub.studentName?.split(' ').map(n => n[0]).join('') || 'ST'}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{sub.studentName}</p>
                      <p className="text-[9px] font-semibold text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
              {submissions.filter((s: Submission) => s.status === 'PENDING').length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 italic text-center py-4">No pending submissions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
