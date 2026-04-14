import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileBarChart, 
  History, 
  Database, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, isActive }) => {
  return (
    <Link to={path}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-hims-blue text-white shadow-md shadow-hims-blue/20' 
            : 'text-hims-slate hover:bg-slate-50 hover:text-hims-blue'
        }`}
      >
        <div className={`${isActive ? 'text-white' : 'text-hims-slate group-hover:text-hims-blue'}`}>
          {icon}
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </motion.div>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, breadcrumb }) => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'User Management', path: '/users' },
    { icon: <BookOpen size={20} />, label: 'Manage Courses', path: '/courses' },
    { icon: <FileBarChart size={20} />, label: 'Reports', path: '/reports' },
    { icon: <History size={20} />, label: 'System Logs', path: '/logs' },
    { icon: <Database size={20} />, label: 'Database Backup', path: '/backup' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const activePageLabel = menuItems.find(item => item.path === location.pathname)?.label || title || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 font-outfit overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-30 shrink-0">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hims-blue rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-hims-blue/20">
              <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white/40 rounded-sm"></div>
                <div className="bg-white/40 rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-hims-blue uppercase">ACADSUBMIT</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <img 
              src="https://ui-avatars.com/api/?name=Mrs.+Caroline&background=0066FF&color=fff" 
              alt="Profile" 
              className="w-10 h-10 rounded-xl"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-hims-dark truncate">Mrs. Caroline</p>
              <p className="text-[10px] font-semibold text-hims-slate uppercase">System Admin</p>
            </div>
            <button className="text-hims-slate hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold text-hims-dark whitespace-nowrap">
              {activePageLabel}
            </h1>
            <div className="hidden md:flex items-center gap-2 text-hims-slate text-sm overflow-hidden">
              <ChevronRight size={14} className="shrink-0" />
              <span className="truncate">{breadcrumb || 'Manage and monitor HIMS Buea system'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-hims-slate" size={18} />
              <input 
                type="text" 
                placeholder="Search files, courses..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-hims-blue outline-none w-64 transition-all"
              />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center text-hims-slate bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-hims-dark">Mrs. Caroline</p>
                <p className="text-[10px] font-semibold text-hims-blue">Online</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 no-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
