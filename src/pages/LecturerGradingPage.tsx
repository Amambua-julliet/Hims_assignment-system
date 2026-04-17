import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { assignmentService } from '../services/assignmentService';
import type { Submission, Assignment } from '../services/assignmentService';
import { doc, getDoc } from 'firebase/firestore';
import { FileIcon, Eye, Download, Star, Bold, Italic, List, Loader2, Info, ArrowUpRight, FileText } from 'lucide-react';

const LecturerGradingPage: React.FC = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Grading State
  const [grade, setGrade] = useState({ ca: 0, exam: 0 });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && submissionId) {
        try {
          // Fetch submission
          const subDoc = await getDoc(doc(db, 'submissions', submissionId));
          if (subDoc.exists()) {
            const subData = { id: subDoc.id, ...subDoc.data() } as Submission;
            setSubmission(subData);
            setGrade({ ca: subData.grade?.ca || 0, exam: subData.grade?.exam || 0 });
            setFeedback(subData.feedback || '');

            // Fetch linked assignment
            const assignDoc = await getDoc(doc(db, 'assignments', subData.assignmentId));
            if (assignDoc.exists()) {
              setAssignment({ id: assignDoc.id, ...assignDoc.data() } as Assignment);
            }
          }
        } catch (err: any) {
          console.error('Error fetching grading data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [submissionId]);

  const handlePublishGrade = async () => {
    if (!submissionId) return;
    try {
      setIsLoading(true);
      await assignmentService.updateGrade(submissionId, {
        ca: Number(grade.ca),
        exam: Number(grade.exam),
        total: Number(grade.ca) + Number(grade.exam)
      }, feedback);
      alert('Grade published successfully!');
      navigate('/lecturer-dashboard');
    } catch (err: any) {
      alert('Failed to publish grade');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Accessing Submission</p>
        </div>
      )}

      {/* Title Section */}
      <div className="flex flex-col gap-1 mb-8">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Grading Console</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assign Grade: {submission?.studentName || 'Student'}</h1>
        <p className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">{assignment?.title || 'Course Assignment'}</p>
      </div>
            {/* Left Section - Grade Details */}
            <div className="flex-1 space-y-8">

              {/* Submitted Files */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5 text-blue-600 font-extrabold text-sm">
                    <FileIcon size={18} />
                    <span>Submitted Files</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-md">1 File Submited</span>
                </div>

                <div className="space-y-4 mb-6">
                  {submission?.fileUrl ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <FileIcon size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{submission.fileName || 'Assignment Submission'}</p>
                          <p className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase">Remote File • Storage Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={18} />
                        </a>
                        <a 
                          href={submission.fileUrl} 
                          download
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 italic">No files attached to this submission.</p>
                  )}
                </div>
              </div>

              {/* Grading & Feedback */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <div className="flex items-center gap-2.5 text-blue-600 font-extrabold text-sm mb-6">
                  <Star size={18} />
                  <span>Grading & Feedback</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Continuous Assessment (CA)</label>
                      <input
                        type="number"
                        value={grade.ca}
                        onChange={(e) => setGrade({...grade, ca: Number(e.target.value)})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Examination Score</label>
                      <input
                        type="number"
                        value={grade.exam}
                        onChange={(e) => setGrade({...grade, exam: Number(e.target.value)})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Lecturer Comments & Feedback</label>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
                      <div className="bg-[#f8fafc] border-b border-slate-100 px-4 py-2.5 flex items-center gap-4 text-slate-400">
                        <button className="hover:text-slate-800 transition-colors"><Bold size={13} /></button>
                        <button className="hover:text-slate-800 transition-colors"><Italic size={13} /></button>
                        <button className="hover:text-slate-800 transition-colors"><List size={14} /></button>
                      </div>
                      <textarea
                        rows={10}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide detailed feedback for the student..."
                        className="w-full p-6 text-sm font-medium text-slate-600 focus:outline-none leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Submission Info */}
            <div className="w-80 shrink-0 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Submission Info</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Grading Status</p>
                    <div className={`flex items-center gap-2 ${submission?.status === 'GRADED' ? 'text-emerald-600' : 'text-orange-500'} text-xs font-bold`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${submission?.status === 'GRADED' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                      {submission?.status || 'PENDING'}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Submitted On</p>
                    <p className="text-xs font-extrabold text-slate-800">{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '...'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Assignment Due</p>
                    <p className="text-xs font-extrabold text-slate-800">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleString() : '...'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Maximum Points</p>
                    <p className="text-xs font-extrabold text-slate-800">{assignment?.points || 100} Points Available</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <Info size={16} />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">Grading Tip</h4>
                </div>
                <p className="text-[12px] font-semibold text-slate-600 leading-relaxed">
                  Refer to the <span className="text-blue-600 font-bold cursor-pointer underline decoration-blue-200">CSC 402 Rubric</span>. Schema design accounts for 40% of the total assignment mark.
                </p>
              </div>

              <div className="space-y-3">
                 <button 
                  onClick={handlePublishGrade}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ArrowUpRight size={18} />
                  {submission?.status === 'GRADED' ? 'Update Grade' : 'Publish Grade'}
                </button>
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <FileText size={18} className="text-slate-400" />
                  Save Draft
                </button>
                <button className="w-full py-4 text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors">
                  Cancel & Discard
                </button>
              </div>
            </div>
    </div>
  );
};

export default LecturerGradingPage;
