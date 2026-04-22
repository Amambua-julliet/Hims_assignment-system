import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload,
  Search,
  SlidersHorizontal,
  FileText,
  Download,
  Eye,
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Submission } from '../services/assignmentService';
import { assignmentService } from '../services/assignmentService';
import { collection, getDocs } from 'firebase/firestore';
import type { FC } from 'react';

interface SubmissionWithTitle extends Submission {
  assignmentTitle?: string;
}

const UploadHistoryPage: FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionWithTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const fetchedSubmissions = await assignmentService.getSubmissionsByStudent(user.uid);
          
          const assignmentsSnap = await getDocs(collection(db, 'assignments'));
          const titlesMap: Record<string, string> = {};
          assignmentsSnap.docs.forEach(doc => {
            titlesMap[doc.id] = doc.data().title;
          });

          const enriched = fetchedSubmissions.map(sub => ({
            ...sub,
            assignmentTitle: titlesMap[sub.assignmentId] || 'Unknown Assignment'
          }));

          setSubmissions(enriched);
        } catch (err) {
          console.error("Error fetching upload history:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       sub.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                      (statusFilter === 'graded' && sub.status === 'GRADED') ||
                      (statusFilter === 'pending' && sub.status !== 'GRADED');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-hims-dark">Upload History</h2>
          <p className="text-hims-slate mt-1 font-medium">Track and manage your submitted assignments</p>
        </div>
        <Link 
          to="/student-courses"
          className="px-6 py-3 bg-hims-blue text-white rounded-xl font-bold flex items-center gap-2 hover:bg-hims-blue/90 transition-all shadow-lg shadow-hims-blue/20"
        >
          <Upload size={18} />
          New Upload
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate" size={18} />
            <input 
              type="text" 
              placeholder="Search by filename or assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none pl-12 pr-4 py-3 rounded-xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/20 outline-none transition-all"
            />
          </div>
          
          <div className="relative min-w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-none pl-4 pr-10 py-3 rounded-xl text-sm font-bold text-hims-dark focus:ring-2 focus:ring-hims-blue/20 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending Review</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-hims-slate rotate-90 pointer-events-none" size={16} />
          </div>

          <button className="p-3 bg-slate-50 text-hims-slate rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-hims-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-hims-slate">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-20 text-center">
            <FileText size={48} className="mx-auto text-hims-slate/30 mb-4" />
            <p className="text-hims-dark font-bold">No submissions found</p>
            <p className="text-sm text-hims-slate mt-1">Upload your first assignment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-hims-slate uppercase tracking-wider">Filename</th>
                  <th className="px-8 py-5 text-xs font-bold text-hims-slate uppercase tracking-wider">Assignment</th>
                  <th className="px-8 py-5 text-xs font-bold text-hims-slate uppercase tracking-wider">Upload Date</th>
                  <th className="px-8 py-5 text-xs font-bold text-hims-slate uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-hims-slate uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubmissions.map((row, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-hims-blue rounded-xl flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <span className="text-sm font-bold text-hims-blue max-w-[200px] truncate">{row.fileName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-hims-dark">{row.assignmentTitle}</p>
                        <p className="text-xs text-hims-slate mt-0.5">Academic Year 2023/2024</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-hims-dark">{new Date(row.submittedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-hims-slate mt-0.5">{new Date(row.submittedAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {row.status === 'GRADED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                          <CheckCircle size={12} />
                          Graded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-hims-blue">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-hims-slate hover:text-hims-blue transition-colors">
                          <Eye size={18} />
                        </a>
                        <a href={row.fileUrl} download={row.fileName} className="p-2 text-hims-slate hover:text-hims-blue transition-colors">
                          <Download size={18} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadHistoryPage;