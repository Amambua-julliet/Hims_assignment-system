import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Star, 
  FileText, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile } from '../services/userService';
import { userService } from '../services/userService';
import type { Assignment, Submission } from '../services/assignmentService';
import { assignmentService } from '../services/assignmentService';
import type { Course } from '../services/courseService';
import { courseService } from '../services/courseService';
import { doc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';

const SubmitAssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && assignmentId) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          const assignDoc = await getDoc(doc(db, 'assignments', assignmentId));
          if (assignDoc.exists()) {
            const assignData = { id: assignDoc.id, ...assignDoc.data() } as Assignment;
            setAssignment(assignData);

            const courseDoc = await getDoc(doc(db, 'courses', assignData.courseId));
            if (courseDoc.exists()) {
              setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
            }
          }
        } catch (err) {
          console.error("Error fetching submission context:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [assignmentId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        setUploading(true);
        // Simplified progress emulation for UI feel
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
        }, 200);

        const res = await uploadToCloudinary(selectedFile);
        setSubmissionUrl(res.secure_url);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (err) {
        alert("File upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleConfirmSubmission = async () => {
    if (!auth.currentUser || !assignmentId || !submissionUrl || !userProfile) return;
    
    try {
      setIsLoading(true);
      await assignmentService.createSubmission({
        assignmentId,
        studentId: auth.currentUser.uid,
        studentName: userProfile.name,
        fileUrl: submissionUrl,
        fileName: file?.name || 'assignment_submission',
      });
      alert("Assignment submitted successfully!");
      navigate('/student-dashboard');
    } catch (err) {
      alert("Failed to submit assignment.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-outfit">
      {/* Student Top Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hims-blue rounded-xl flex items-center justify-center text-white">
              <Star size={24} />
            </div>
            <span className="text-xl font-extrabold text-[#0F172A] tracking-tight uppercase">ACADSUBMIT</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-bold text-hims-slate hover:text-hims-blue transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-bold text-hims-slate hover:text-hims-blue transition-colors">Courses</a>
            <a href="#" className="text-sm font-bold text-hims-blue border-b-2 border-hims-blue py-7">Assignments</a>
            <a href="#" className="text-sm font-bold text-hims-slate hover:text-hims-blue transition-colors">Grades</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2.5 rounded-full hover:bg-slate-50 text-hims-slate relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <img 
            src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff`}
            alt="Student" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
          />
        </div>
      </header>

      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={56} />
          <p className="text-[12px] font-extrabold uppercase tracking-[0.3em]">Preparing Submission Console</p>
        </div>
      )}

      <main className="p-4 md:p-10 space-y-8">
        {/* Breadcrumb & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-hims-slate uppercase tracking-wider">
            <span>{course?.code || 'FETCHING'}</span>
            <ChevronRight size={12} />
            <span className="text-hims-blue">Assignments</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-2 tracking-tight">{assignment?.title || 'Loading Assignment...'}</h1>
              <p className="text-hims-slate font-medium">{course?.name || 'HIMS Buea Academic Portal'}</p>
            </div>
            <div className="flex gap-3">
               <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 text-hims-blue rounded-xl flex items-center justify-center">
                   <Clock size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-hims-slate uppercase mb-0.5">Due Date</p>
                   <p className="text-sm font-bold text-hims-dark">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '...'}</p>
                 </div>
               </div>
               <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                   <Star size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-hims-slate uppercase mb-0.5">Points</p>
                   <p className="text-sm font-bold text-hims-dark">{assignment?.points || 100} Max</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Instructions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-hims-blue">
                <FileText size={24} />
                <h3 className="text-lg font-bold text-hims-dark">Assignment Instructions</h3>
              </div>
              <p className="text-sm text-hims-slate leading-relaxed font-medium">
                Please read the following requirements carefully before submitting your final project.
              </p>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-hims-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-hims-dark">Allowed Formats:</h4>
                    <p className="text-xs text-hims-slate mt-1">Submit your design as a PDF or ZIP file containing the SQL script and ER diagrams.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-hims-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-hims-dark">Naming Convention:</h4>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-mono text-hims-slate mt-2 inline-block">
                      StudentName_ProjectTitle.extension
                    </div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-hims-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-hims-dark">File Size:</h4>
                    <p className="text-xs text-hims-slate mt-1">Maximum allowed file size is 50MB.</p>
                  </div>
                </li>
              </ul>

              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 space-y-3">
                <h4 className="text-sm font-bold text-hims-blue">Need help?</h4>
                <p className="text-xs text-hims-slate leading-relaxed font-medium">
                  Contact your lab instructor if you have issues with the portal upload.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Upload Zone */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-xl font-bold text-hims-dark">Submission Files</h3>
               
               <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center text-center space-y-6 group hover:border-hims-blue/30 transition-colors bg-slate-50/30 cursor-pointer"
               >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.zip,.doc,.docx"
                  />
                  <div className="w-16 h-16 bg-hims-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-hims-blue/20">
                    {uploading ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-hims-dark tracking-tight">
                      {file ? file.name : 'Drag and drop your project files here'}
                    </h4>
                    <p className="text-sm text-hims-slate font-medium max-w-xs mx-auto">
                      {uploading ? `Uploading to secure storage... ${uploadProgress}%` : 'Upload your ER diagrams, schema documentation, and SQL initialization scripts.'}
                    </p>
                  </div>
                  {!file && (
                    <button className="bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-3 px-8 rounded-2xl transition-all pointer-events-none">
                      Browse Files
                    </button>
                  )}
               </div>

               {submissionUrl && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-hims-slate uppercase tracking-[0.15em]">Attached File (Ready for Submission)</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-hims-blue/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-hims-blue rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-hims-dark">{file?.name}</h5>
                            <p className="text-xs text-hims-slate font-medium italic mt-0.5">Secure Cloud Storage Active</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <a href={submissionUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-hims-slate hover:text-blue-600 transition-colors">
                            <FileText size={18} />
                          </a>
                          <button 
                            onClick={() => { setFile(null); setSubmissionUrl(''); }}
                            className="p-2 text-hims-slate hover:text-red-500 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
               )}
            </div>

            {/* Comments Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-hims-dark">Comments for Lecturer</h3>
              <textarea 
                placeholder="Add any notes about your submission here..."
                className="w-full h-32 bg-slate-50 border-slate-100 rounded-2xl p-6 text-sm font-medium focus:bg-white focus:ring-hims-blue/10 transition-all resize-none"
              ></textarea>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider uppercase">Final submission cannot be undone after grading starts.</span>
                </div>
                 <div className="flex items-center gap-4">
                   <button 
                    onClick={() => navigate('/student-dashboard')}
                    className="px-8 py-3 rounded-2xl border border-slate-200 text-hims-dark font-bold hover:bg-slate-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleConfirmSubmission}
                    disabled={!submissionUrl || uploading || isLoading}
                    className="bg-hims-blue hover:bg-hims-blue/90 disabled:opacity-50 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-hims-blue/20 flex items-center gap-2 group transition-all"
                   >
                     <span>Confirm Submission</span>
                     <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-hims-slate uppercase tracking-wider">© 2023 HIMS Buea - Academic Submission Portal (ACADSUBMIT). All rights reserved.</p>
          <div className="flex items-center gap-8">
             <a href="#" className="text-xs font-bold text-hims-slate hover:text-hims-blue uppercase tracking-wider transition-colors">Privacy Policy</a>
             <a href="#" className="text-xs font-bold text-hims-slate hover:text-hims-blue uppercase tracking-wider transition-colors">Support Center</a>
             <a href="#" className="text-xs font-bold text-hims-slate hover:text-hims-blue uppercase tracking-wider transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SubmitAssignmentPage;
