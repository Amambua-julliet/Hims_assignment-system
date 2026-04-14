import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock
} from 'lucide-react';
import { userService } from '../services/userService';

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
  const [counts, setCounts] = React.useState({ students: 0, pending: 0, total: 0 });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const allUsers = await userService.getAllUsers();
        setCounts({
          students: allUsers.filter(u => u.role === 'STUDENT').length,
          pending: allUsers.filter(u => u.status === 'PENDING').length,
          total: allUsers.length
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Students', value: isLoading ? '...' : counts.students.toLocaleString(), change: '+0%', icon: <Users size={20} />, color: 'bg-blue-500', isPositive: true },
    { title: 'Active Courses', value: '42', change: '+0%', icon: <BookOpen size={20} />, color: 'bg-indigo-500', isPositive: true },
    { title: 'Attendance Rate', value: '94.2%', change: '+0%', icon: <CheckCircle2 size={20} />, color: 'bg-emerald-500', isPositive: true },
    { title: 'Pending Issues', value: isLoading ? '...' : counts.pending.toString(), change: '0', icon: <AlertCircle size={20} />, color: 'bg-rose-500', isPositive: false },
  ];

  const recentActivities = [
    { id: 1, user: 'Dr. John Smith', action: 'Uploaded new course material', target: 'Introduction to Business', time: '10 minutes ago' },
    { id: 2, user: 'Sarah Johnson', action: 'Submitted assignment', target: 'Marketing Strategy 101', time: '25 minutes ago' },
    { id: 3, user: 'System', action: 'Automated backup completed', target: 'Daily Snapshot', time: '2 hours ago' },
    { id: 4, user: 'Admin Caroline', action: 'Updated user permissions', target: 'Staff Member: Robert K.', time: '5 hours ago' },
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
        {/* Main Chart Area (Simulated) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-hims-dark">Student Performance</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-bold text-hims-slate px-3 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 50].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                className="w-full bg-slate-100 rounded-t-lg relative group"
              >
                <div className={`absolute inset-0 bg-hims-blue/20 group-hover:bg-hims-blue transition-all rounded-t-lg ${i === 7 ? 'bg-hims-blue' : ''}`}></div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-hims-slate uppercase tracking-wider px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-hims-dark mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-hims-blue ring-4 ring-hims-blue/10"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-hims-dark">{activity.user}</p>
                  <p className="text-xs text-hims-slate mt-0.5">{activity.action} <span className="text-hims-blue font-semibold">{activity.target}</span></p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-hims-slate/60 uppercase tracking-tight">
                    <Clock size={10} />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-dashed border-slate-200 text-hims-slate text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
