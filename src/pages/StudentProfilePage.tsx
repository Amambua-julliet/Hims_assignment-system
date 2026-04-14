import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Star,
  History,
  Search,
  Bell,
  User,
  LogOut,
  Loader2,
  Mail,
  GraduationCap,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching profile data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#fafafa] font-outfit overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 z-10">
        <div className="p-8">
          <Link to="/student-dashboard" className="flex flex-col gap-1">
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
                <span className="text-[15px] font-extrabold text-blue-600 tracking-tight leading-tight">ACADSUBMIT</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">HIMS Buea</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {[
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: false, path: '/student-dashboard' },
            { icon: <BookOpen size={18} />, label: 'My Courses', active: false, path: '/student-courses' },
            { icon: <Star size={18} />, label: 'My Grades', active: false, path: '/student-grades' },
            { icon: <History size={18} />, label: 'Upload History', active: false, path: '/upload-history' },
            { icon: <User size={18} />, label: 'Profile', active: true, path: '/student-profile' },
          ].map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${item.active
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className={item.active ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button 
            onClick={async () => { await signOut(auth); navigate('/login'); }}
            className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-rose-500 transition-colors mb-6"
          >
            <LogOut size={18} />
            Logout
          </button>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">POWERED BY HIMS BUEA</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Loading Profile</p>
          </div>
        )}
        
        {/* Header */}
        <header className="px-10 py-6 shrink-0 flex items-center justify-between bg-white border-b border-slate-50 relative z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full bg-[#f8fafc] border-none pl-12 pr-4 py-3 rounded-2xl text-[13px] font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full relative no-scrollbar">
          {/* Top Banner Area */}
          <div className="h-64 bg-slate-900 w-full relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          </div>

          <div className="max-w-5xl mx-auto px-10 relative -mt-24 pb-20">
            {/* Profile Avatar and Main Info Container */}
            <div className="flex items-end justify-between mb-8">
              <div className="flex gap-6 items-end">
                <div className="p-1.5 bg-white rounded-[2rem] shadow-xl relative group">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff&size=200`}
                    alt="Profile Avatar" 
                    className="w-36 h-36 rounded-[1.5rem] object-cover"
                  />
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">{userProfile?.name}</h1>
                    <BadgeCheck className="text-blue-400" size={28} />
                  </div>
                  <p className="text-slate-300 font-bold tracking-wide mt-1 uppercase text-sm">
                    {userProfile?.department} {userProfile?.level && `• ${userProfile.level}`}
                  </p>
                </div>
              </div>
              <div className="pb-2">
                 <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg">
                   Edit Profile
                 </button>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              {/* Left Column (Main Info) */}
              <div className="col-span-2 space-y-8">
                
                {/* Personal Information Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Legal Name</p>
                      <p className="text-[15px] font-bold text-slate-900">{userProfile?.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</p>
                      <div className="flex items-center gap-2">
                         <Mail size={16} className="text-slate-300" />
                         <p className="text-[15px] font-bold text-slate-900">{userProfile?.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Matricule (ID)</p>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-100">
                        <p className="text-[14px] font-extrabold text-blue-600 font-mono tracking-widest">{userProfile?.matricule || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">System Role</p>
                      <p className="text-[15px] font-bold text-slate-900">{userProfile?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Profile Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" size={20} />
                    Academic Standing
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Faculty / Department</p>
                      <p className="text-[15px] font-bold text-slate-900">{userProfile?.department || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Level</p>
                      <p className="text-[15px] font-bold text-slate-900">{userProfile?.level || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Enrollment Status</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         {userProfile?.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Account Created</p>
                      <div className="flex items-center gap-2">
                         <CalendarDays size={16} className="text-slate-300" />
                         <p className="text-[15px] font-bold text-slate-900">
                           {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Side Actions) */}
              <div className="space-y-6">
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8"></div>
                  <ShieldCheck size={32} className="text-blue-200 mb-4" />
                  <h3 className="text-lg font-extrabold mb-2">Account Security</h3>
                  <p className="text-sm text-blue-100 font-medium mb-6">Manage your password and active sessions to keep your account secure.</p>
                  <button className="w-full bg-white text-blue-600 font-bold py-3.5 rounded-xl text-sm transition-transform hover:scale-[1.02] active:scale-95">
                    Change Password
                  </button>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-[14px] font-extrabold text-slate-900 mb-1.5">Campus Location</h3>
                  <p className="text-xs font-semibold text-slate-400 mb-4">Higher Institute of Management Studies (HIMS), Buea</p>
                  <div className="w-full h-px bg-slate-100 mb-4"></div>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide">View on Map</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfilePage;
