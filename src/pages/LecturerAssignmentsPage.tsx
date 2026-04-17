import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  UploadCloud,
  Send,
  Info,
  ShieldCheck,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Bell,
  X,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { uploadToCloudinary } from '../lib/cloudinary';

const LecturerAssignmentsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const fetchData = async (uid: string) => {
    try {
      setIsLoading(true);
      const [lecturerCourses, lecturerAssignments] = await Promise.all([
        courseService.getCoursesByLecturer(uid),
        assignmentService.getAssignmentsByLecturer(uid)
      ]);
      setCourses(lecturerCourses);
      setAssignments(lecturerAssignments);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user.uid);
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
    if (e) e.preventDefault();

    if (!auth.currentUser) {
      alert('You must be logged in to post assignments');
      return;
    }

    // Explicit Validation
    if (!formData.title.trim()) return alert('Assignment title is required');
    if (!formData.courseId) return alert('Please select a course');
    if (!formData.dueDate) return alert('Deadline date is required');
    if (!formData.instructions.trim()) return alert('Instructions are required');

    try {
      setIsLoading(true);
      const assignmentData = {
        title: formData.title.trim(),
        courseId: formData.courseId,
        lecturerId: auth.currentUser.uid,
        dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
        points: Number(formData.points) || 100,
        instructions: formData.instructions.trim(),
        fileUrl: formData.fileUrl || ''
      };

      if (editingId) {
        await assignmentService.updateAssignment(editingId, assignmentData);
        alert('Assignment updated successfully!');
      } else {
        await assignmentService.createAssignment(assignmentData);
        alert('Assignment posted successfully!');
      }

      // Reset Form and Refresh List
      setFormData({
        title: '',
        courseId: '',
        dueDate: '',
        dueTime: '23:59',
        points: 100,
        instructions: '',
        fileUrl: ''
      });
      setEditingId(null);
      fetchData(auth.currentUser.uid);
    } catch (err: any) {
      console.error('CRITICAL: Failed to save assignment:', err);
      alert('Failed to save assignment: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAssignment = (assignment: any) => {
    const [date, time] = assignment.dueDate.split('T');
    setFormData({
      title: assignment.title,
      courseId: assignment.courseId,
      dueDate: date,
      dueTime: time.substring(0, 5),
      points: assignment.points,
      instructions: assignment.instructions,
      fileUrl: assignment.fileUrl || ''
    });
    setEditingId(assignment.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      setIsLoading(true);
      await assignmentService.deleteAssignment(id);
      if (auth.currentUser) fetchData(auth.currentUser.uid);
      if (editingId === id) {
        setEditingId(null);
        setFormData({
          title: '',
          courseId: '',
          dueDate: '',
          dueTime: '23:59',
          points: 100,
          instructions: '',
          fileUrl: ''
        });
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      courseId: '',
      dueDate: '',
      dueTime: '23:59',
      points: 100,
      instructions: '',
      fileUrl: ''
    });
  };

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synchronizing Console</p>
        </div>
      )}

      <div className="flex flex-col gap-1 mb-6">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Faculty Resources</p>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {editingId ? 'Edit Assignment' : 'Post New Assignment'}
        </h2>
      </div>

      <form onSubmit={handlePostAssignment} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Assignment Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Database Design Project"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Course Selection</label>
            <div className="relative">
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-extrabold text-slate-800 mb-2.5">Assignment Instructions</label>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="bg-[#f8fafc] border-b border-slate-200 px-4 py-3 flex items-center gap-4 text-slate-500">
              <button type="button" className="hover:text-slate-800 transition-colors"><Bold size={14} strokeWidth={3} /></button>
              <button type="button" className="hover:text-slate-800 transition-colors"><Italic size={14} strokeWidth={3} /></button>
              <button type="button" className="hover:text-slate-800 transition-colors"><Underline size={14} strokeWidth={3} /></button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button type="button" className="hover:text-slate-800 transition-colors"><List size={16} strokeWidth={2.5} /></button>
              <button type="button" className="hover:text-slate-800 transition-colors"><ListOrdered size={16} strokeWidth={2.5} /></button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button type="button" className="hover:text-slate-800 transition-colors"><LinkIcon size={14} strokeWidth={2.5} /></button>
              <button type="button" className="hover:text-slate-800 transition-colors"><ImageIcon size={14} strokeWidth={2.5} /></button>
            </div>
            <textarea
              rows={6}
              required
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
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
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, fileUrl: '' }) }}
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
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 text-[15px] font-extrabold hover:bg-slate-50 transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-extrabold transition-colors shadow-md shadow-blue-200"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {isLoading ? (editingId ? 'Updating...' : 'Posting...') : (editingId ? 'Update Assignment' : 'Post Assignment')}
          </button>
        </div>
      </form>

      {/* Assignment Management List */}
      <div className="pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Manage Existing Assignments</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Review, edit, or remove your academic postings.</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
            <Info size={14} className="text-blue-600" />
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-widest">{assignments.length} Total Postings</span>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.length === 0 && !isLoading && (
            <div className="bg-white p-16 rounded-[2rem] border border-dashed border-slate-200 text-center">
              <Plus size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Assignments Found</p>
              <p className="text-xs text-slate-300 mt-2">You haven't posted any assignments yet for your courses.</p>
            </div>
          )}

          {assignments.map((assignment) => {
            const course = courses.find(c => c.id === assignment.courseId);
            return (
              <div key={assignment.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{assignment.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {course?.code || 'GEN'}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[11px] font-bold">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[11px] font-bold text-slate-400">{assignment.points} Points</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditAssignment(assignment)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Assignment"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Assignment"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
  );
};

export default LecturerAssignmentsPage;
