import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Terminal, 
  Database, 
  Settings, 
  LogOut, 
  GraduationCap 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'User Management', path: '/users' },
    { icon: <BookOpen size={20} />, label: 'Manage Courses', path: '/courses' },
    { icon: <FileText size={20} />, label: 'Reports', path: '/reports' },
    { icon: <Terminal size={20} />, label: 'System Logs', path: '/logs' },
    { icon: <Database size={20} />, label: 'Database Backup', path: '/backup' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-72 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-hims-blue rounded-xl flex items-center justify-center text-white">
          <GraduationCap size={24} />
        </div>
        <span className="text-xl font-bold text-hims-blue tracking-tight">ACADSUBMIT</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200
              ${isActive 
                ? 'bg-hims-blue/5 text-hims-blue shadow-sm shadow-hims-blue/5 border border-hims-blue/10' 
                : 'text-hims-slate hover:bg-slate-50 hover:text-hims-dark'}
            `}
          >
            <span className={({ isActive }: any) => isActive ? 'text-hims-blue' : 'text-slate-400 group-hover:text-hims-dark'}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Caroline&backgroundColor=b6e3f4" 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-hims-dark truncate">Mrs. Caroline</p>
            <p className="text-[11px] font-medium text-hims-slate uppercase tracking-wider">System Admin</p>
          </div>
        </div>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-hims-slate hover:bg-slate-50 hover:text-red-500 transition-all duration-200 border border-transparent hover:border-red-100">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
