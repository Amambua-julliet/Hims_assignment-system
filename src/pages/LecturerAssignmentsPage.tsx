import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Calendar,
  Clock,
  Star,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  UploadCloud,
  Save,
  Send,
  Info,
  ShieldCheck,
  ChevronDown,
  Megaphone,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { uploadToCloudinary } from '../lib/cloudinary';

const LecturerAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    dueDate: '',
    dueTime: '23:59',
    points: 100,
    instructions: '',
    fileUrl: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);
          const lecturerCourses = await courseService.getCoursesByLecturer(user.uid);
          setCourses(lecturerCourses);
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadToCloudinary(file);
      setFormData({ ...formData, fileUrl: res.secure_url });
    } catch (err) {
      alert('Upload failed. Please check your Cloudinary configuration.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!formData.courseId) return alert('Please select a course');

    try {
      setIsLoading(true);
      await assignmentService.createAssignment({
        title: formData.title,
        courseId: formData.courseId,
        lecturerId: auth.currentUser.uid,
        dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
        points: Number(formData.points),
        instructions: formData.instructions,
        fileUrl: formData.fileUrl
      });
      alert('Assignment posted successfully!');
      navigate('/lecturer-dashboard');
    } catch (err) {
      alert('Failed to post assignment');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen bg-slate-50 font-outfit overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
        <div className="p-8">
          <Link to="/lecturer-dashboard" className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center p-1.5 shadow-md shadow-blue-200">
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-extrabold text-slate-800 tracking-tight leading-tight">ACADSUBMIT</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">HIMS Buea</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          {[
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: false, path: '/lecturer-dashboard' },
            { icon: <BookOpen size={18} />, label: 'My Courses', active: false, path: '/lecturer-courses' },
            { icon: <FileText size={18} />, label: 'Assignments', active: true, path: '/lecturer-assignments' },
            { icon: <Star size={18} />, label: 'Grading', active: false, path: '/lecturer-grading' },
            { icon: <Megaphone size={18} />, label: 'Announcements', active: false, path: '#' },
          ].map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${item.active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className={item.active ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff`}
              alt={userProfile?.name} 
              className="w-10 h-10 rounded-full border-2 border-slate-100"
            />
            <div className="overflow-hidden">
              <p className="text-[13px] font-extrabold text-slate-900 truncate uppercase tracking-tight">{userProfile?.name || 'Loading...'}</p>
              <p className="text-[10px] font-semibold text-slate-400">{userProfile?.role || 'Lecturer'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synchronizing Console</p>
          </div>
        )}
        {/* Header */}
        <header className="px-10 py-8 shrink-0 flex items-start justify-between bg-white">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Lecturer Console</p>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Post New Assignment</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 no-scrollbar">
          <div className="space-y-8">

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Database Design Project"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Course Selection</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Due Time</label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={formData.dueTime}
                    onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Points / Weighting</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Star size={18} />
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 100"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: Number(e.target.value)})}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Assignment Instructions</label>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-4 py-3 flex items-center gap-4 text-slate-500">
                  <button className="hover:text-slate-800 transition-colors"><Bold size={14} strokeWidth={3} /></button>
                  <button className="hover:text-slate-800 transition-colors"><Italic size={14} strokeWidth={3} /></button>
                  <button className="hover:text-slate-800 transition-colors"><Underline size={14} strokeWidth={3} /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button className="hover:text-slate-800 transition-colors"><List size={16} strokeWidth={2.5} /></button>
                  <button className="hover:text-slate-800 transition-colors"><ListOrdered size={16} strokeWidth={2.5} /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button className="hover:text-slate-800 transition-colors"><LinkIcon size={14} strokeWidth={2.5} /></button>
                  <button className="hover:text-slate-800 transition-colors"><ImageIcon size={14} strokeWidth={2.5} /></button>
                </div>
                <textarea
                  rows={6}
                  placeholder="Enter detailed instructions for your students here..."
                  className="w-full p-4 text-[14px] font-medium text-slate-700 focus:outline-none resize-none placeholder:text-slate-400"
                ></textarea>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Reference Materials / Rubrics</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl bg-[#f8fafc] p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                    <p className="text-sm font-bold text-slate-600">Uploading to Cloudinary...</p>
                  </div>
                ) : formData.fileUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">File Uploaded Successfully!</h4>
                    <p className="text-[11px] font-bold text-blue-500 truncate max-w-md">{formData.fileUrl}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFormData({...formData, fileUrl: ''}) }}
                      className="mt-4 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest flex items-center gap-1 hover:text-rose-600"
                    >
                      <X size={12} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">Click to upload reference materials</h4>
                    <p className="text-[13px] font-semibold text-slate-400">Support for PDF, DOCX, XLSX, and images (Max 25MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="submit"
                onClick={handlePostAssignment}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-extrabold transition-colors shadow-md shadow-blue-200"
              >
                <Send size={18} />
                Post Assignment
              </button>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="bg-[#f0f7ff] rounded-2xl p-5 border border-[#e0efff]">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Info size={12} strokeWidth={3} />
                  </div>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest leading-none">Visibility</h5>
                </div>
                <p className="text-[12px] font-semibold text-slate-600 leading-relaxed pr-2">
                  Assignment will be visible to all enrolled students immediately after posting.
                </p>
              </div>

              <div className="bg-[#f0f7ff] rounded-2xl p-5 border border-[#e0efff]">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Bell size={12} strokeWidth={3} />
                  </div>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest leading-none">Notifications</h5>
                </div>
                <p className="text-[12px] font-semibold text-slate-600 leading-relaxed pr-2">
                  Students will receive push notifications and email alerts automatically.
                </p>
              </div>

              <div className="bg-[#f0f7ff] rounded-2xl p-5 border border-[#e0efff]">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShieldCheck size={12} strokeWidth={3} />
                  </div>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest leading-none">Plagiarism</h5>
                </div>
                <p className="text-[12px] font-semibold text-slate-600 leading-relaxed pr-2">
                  Submissions will be automatically screened for academic integrity.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LecturerAssignmentsPage;
