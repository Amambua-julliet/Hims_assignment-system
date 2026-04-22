import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle,
  X,
  Users,
  GraduationCap,
  Clock,
  Send
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { userService, type UserProfile } from '../services/userService';

interface Report {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reporterRole: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

const reportReasons = [
  { id: 'academic_misconduct', label: 'Academic Misconduct', description: 'Plagiarism, cheating, or academic fraud' },
  { id: 'fraud', label: 'Fraudulent Activity', description: 'Fake submissions identity theft or document forgery' },
  { id: 'harassment', label: 'Harassment', description: 'Bullying, threats, or inappropriate behavior' },
  { id: 'misuse', label: 'System Misuse', description: 'Unauthorized access or abuse of platform' },
  { id: 'other', label: 'Other Violation', description: 'Other policy violations' },
];

const ReportsPage: React.FC = () => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef, 
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setRecentReports(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const roleFilter = userType === 'student' ? 'student' : 'lecturer';
      const allUsers = await userService.getAllUsers();
      const filtered = allUsers.filter(u => 
        u.role?.toUpperCase() === roleFilter.toUpperCase() &&
        (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.matricule?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedReason || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reportedUserId: selectedUser.id,
        reportedUserName: selectedUser.name,
        reportedUserEmail: selectedUser.email,
        reportedUserRole: selectedUser.role,
        reporterRole: 'admin',
        reason: selectedReason,
        description: description,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedUser(null);
        setSelectedReason('');
        setDescription('');
        setSearchQuery('');
        setSearchResults([]);
        fetchRecentReports();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonLabel = (reasonId: string) => {
    return reportReasons.find(r => r.id === reasonId)?.label || reasonId;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-hims-dark">Report User</h2>
          <p className="text-hims-slate mt-1 font-medium">Submit a report for student or teacher accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Type Selection */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-hims-dark mb-6">Select User Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setUserType('student'); setSearchResults([]); setSelectedUser(null); }}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  userType === 'student' 
                    ? 'border-hims-blue bg-hims-blue/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <GraduationCap size={32} className={userType === 'student' ? 'text-hims-blue' : 'text-hims-slate'} />
                <p className={`mt-2 font-bold ${userType === 'student' ? 'text-hims-blue' : 'text-hims-dark'}`}>Student</p>
                <p className="text-xs text-hims-slate mt-1">Report student accounts</p>
              </button>
              <button
                onClick={() => { setUserType('teacher'); setSearchResults([]); setSelectedUser(null); }}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  userType === 'teacher' 
                    ? 'border-hims-blue bg-hims-blue/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <Users size={32} className={userType === 'teacher' ? 'text-hims-blue' : 'text-hims-slate'} />
                <p className={`mt-2 font-bold ${userType === 'teacher' ? 'text-hims-blue' : 'text-hims-dark'}`}>Teacher</p>
                <p className="text-xs text-hims-slate mt-1">Report lecturer accounts</p>
              </button>
            </div>
          </div>

          {/* Search User */}
          {!selectedUser && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-hims-dark mb-6">Find {userType === 'student' ? 'Student' : 'Teacher'}</h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate" size={20} />
                  <input
                    type="text"
                    placeholder={`Search by name, email, or matricule...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hims-blue/20 focus:border-hims-blue outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-3 bg-hims-blue text-white rounded-xl font-bold hover:bg-hims-blue/90 transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl cursor-pointer hover:border-hims-blue/30 hover:bg-hims-blue/5 transition-all"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0066FF&color=fff`}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-hims-dark">{user.name}</p>
                        <p className="text-sm text-hims-slate">{user.email}</p>
                      </div>
                      {user.matricule && (
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-hims-slate">
                          {user.matricule}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected User & Report Details */}
          {selectedUser && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-hims-dark">Report Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-hims-slate" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=0066FF&color=fff`}
                  alt={selectedUser.name}
                  className="w-14 h-14 rounded-xl"
                />
                <div className="flex-1">
                  <p className="font-bold text-hims-dark text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-hims-slate">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      selectedUser.role === 'STUDENT' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                    }`}>
                      {selectedUser.role}
                    </span>
                    {selectedUser.matricule && (
                      <span className="text-xs font-bold text-hims-slate">{selectedUser.matricule}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-hims-dark mb-2">Reason for Report</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedReason === reason.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <p className={`font-bold ${selectedReason === reason.id ? 'text-rose-600' : 'text-hims-dark'}`}>
                          {reason.label}
                        </p>
                        <p className="text-xs text-hims-slate mt-1">{reason.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-hims-dark mb-2">Detailed Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about the violation..."
                    rows={4}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-hims-blue/20 focus:border-hims-blue outline-none transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedReason || !description.trim()}
                  className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle size={20} />
                      Report Submitted!
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reports Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-100 rounded-xl">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-hims-dark">Recent Reports</h3>
              <p className="text-xs text-hims-slate">View report history</p>
            </div>
          </div>

          {recentReports.length === 0 ? (
            <p className="text-sm text-hims-slate text-center py-8">No reports submitted yet</p>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-hims-dark text-sm truncate">{report.reportedUserName}</p>
                      <p className="text-xs text-hims-slate truncate">{report.reportedUserEmail}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-hims-slate">{getReasonLabel(report.reason)}</span>
                    <div className="flex items-center gap-1 text-xs text-hims-slate/50">
                      <Clock size={10} />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;