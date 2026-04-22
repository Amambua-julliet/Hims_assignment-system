import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { userService, type UserProfile } from '../services/userService';
import { courseService } from '../services/courseService';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode; 
  color: string;
  isPositive: boolean;
}> = ({ title, value, change, icon, color, isPositive }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        <TrendingUp size={14} className={isPositive ? '' : 'rotate-180'} />
        {change}
      </div>
    </div>
    <div>
      <p className="text-hims-slate text-sm font-semibold">{title}</p>
      <h3 className="text-2xl font-bold text-hims-dark mt-1">{value}</h3>
    </div>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = React.useState({ students: 0, lecturers: 0, courses: 0, pending: 0 });
  const [latestUsers, setLatestUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        let allUsers: any[] = [];
        let allCourses: any[] = [];

        try {
          allUsers = await userService.getAllUsers();
        } catch (e: any) {
          console.error("Failed to fetch users:", e);
        }

        try {
          allCourses = await courseService.getAllCourses();
        } catch (e: any) {
          console.error("Failed to fetch courses:", e);
        }

        setCounts({
          students: allUsers.filter(u => u.role?.toUpperCase() === 'STUDENT').length,
          lecturers: allUsers.filter(u => u.role?.toUpperCase() === 'LECTURER').length,
          courses: allCourses.length,
          pending: allUsers.filter(u => u.status?.toUpperCase() === 'PENDING').length
        });

        // Get latest 5 users
        const sortedUsers = [...allUsers].sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setLatestUsers(sortedUsers.slice(0, 5));
      } catch (err) {
        console.error('Error in stats logic:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Students', value: isLoading ? '...' : counts.students.toLocaleString(), change: '+0%', icon: <Users size={20} />, color: 'bg-blue-500', isPositive: true },
    { title: 'Total Lecturers', value: isLoading ? '...' : counts.lecturers.toLocaleString(), change: '+0%', icon: <Users size={20} />, color: 'bg-violet-500', isPositive: true },
    { title: 'Active Courses', value: isLoading ? '...' : counts.courses.toLocaleString(), change: '+0%', icon: <BookOpen size={20} />, color: 'bg-indigo-500', isPositive: true },
    { title: 'Pending Issues', value: isLoading ? '...' : counts.pending.toString(), change: '0', icon: <AlertCircle size={20} />, color: 'bg-rose-500', isPositive: false },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-hims-dark">Dashboard Overview</h2>
          <p className="text-hims-slate mt-1 font-medium">Welcome back, here's what's happening today at HIMS.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-semibold text-hims-dark">
            <Calendar size={16} className="text-hims-blue" />
            <span>March 12, 2026</span>
          </div>
          <button className="px-4 py-2 bg-hims-blue text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-hims-blue/20 hover:bg-hims-blue/90 transition-all">
            <ArrowUpRight size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Recharts) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-hims-dark">Student Performance</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-bold text-hims-slate px-3 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Jan', students: Math.round(counts.students * 0.15), lecturers: Math.round(counts.lecturers * 0.2) },
              { name: 'Feb', students: Math.round(counts.students * 0.22), lecturers: Math.round(counts.lecturers * 0.25) },
              { name: 'Mar', students: Math.round(counts.students * 0.35), lecturers: Math.round(counts.lecturers * 0.4) },
              { name: 'Apr', students: Math.round(counts.students * 0.45), lecturers: Math.round(counts.lecturers * 0.55) },
              { name: 'May', students: Math.round(counts.students * 0.65), lecturers: Math.round(counts.lecturers * 0.7) },
              { name: 'Jun', students: counts.students, lecturers: counts.lecturers },
            ]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]} fill="#3b82f6">
                {[
                  <Cell key="cell-0" fill="#3b82f6" />,
                  <Cell key="cell-1" fill="#3b82f6" />,
                  <Cell key="cell-2" fill="#3b82f6" />,
                  <Cell key="cell-3" fill="#3b82f6" />,
                  <Cell key="cell-4" fill="#3b82f6" />,
                  <Cell key="cell-5" fill="#3b82f6" />,
                ]}
              </Bar>
              <Bar dataKey="lecturers" name="Lecturers" radius={[6, 6, 0, 0]} fill="#8b5cf6">
                {[
                  <Cell key="cell-0" fill="#8b5cf6" />,
                  <Cell key="cell-1" fill="#8b5cf6" />,
                  <Cell key="cell-2" fill="#8b5cf6" />,
                  <Cell key="cell-3" fill="#8b5cf6" />,
                  <Cell key="cell-4" fill="#8b5cf6" />,
                  <Cell key="cell-5" fill="#8b5cf6" />,
                ]}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Members */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-hims-dark">Latest Members</h3>
            <Link to="/user-management" className="text-xs font-bold text-hims-blue hover:underline uppercase tracking-wider">View All</Link>
          </div>
          <div className="space-y-6">
            {latestUsers.length === 0 && !isLoading && (
              <p className="text-sm text-hims-slate text-center py-4">No recent signups found.</p>
            )}
            {latestUsers.map((user) => (
              <div key={user.id} className="flex gap-4 group">
                <div className="relative shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=64748b&bold=true`}
                    alt={user.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 group-hover:border-hims-blue/30 transition-colors"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    user.role?.toUpperCase() === 'STUDENT' ? 'bg-blue-500' : 'bg-violet-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-hims-dark truncate">{user.name}</p>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0 ${
                      user.role?.toUpperCase() === 'STUDENT' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-violet-50 text-violet-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-hims-slate truncate mt-0.5 font-medium">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-hims-slate/50 uppercase tracking-tighter">
                    <Clock size={10} />
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
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

export default AdminDashboard;
