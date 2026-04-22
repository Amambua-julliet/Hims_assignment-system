import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail,
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import type { FC } from 'react';

const StudentProfilePage: FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching profile data:", err);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-hims-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-hims-dark">My Profile</h2>
          <p className="text-hims-slate mt-1 font-medium">View and manage your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-hims-dark mb-6 flex items-center gap-2">
              <BadgeCheck className="text-hims-blue" size={20} />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Full Name</p>
                <p className="text-base font-bold text-hims-dark">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-hims-slate" />
                  <p className="text-base font-bold text-hims-dark">{userProfile.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Matricule (ID)</p>
                <div className="bg-slate-50 px-3 py-2 rounded-lg inline-block border border-slate-100">
                  <p className="text-sm font-bold text-hims-blue font-mono">{userProfile.matricule || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">System Role</p>
                <p className="text-base font-bold text-hims-dark">{userProfile.role}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-hims-dark mb-6 flex items-center gap-2">
              <GraduationCap className="text-hims-blue" size={20} />
              Academic Standing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Faculty / Department</p>
                <p className="text-base font-bold text-hims-dark">{userProfile.department || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Academic Level</p>
                <p className="text-base font-bold text-hims-dark">{userProfile.level || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Enrollment Status</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {userProfile.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-2">Account Created</p>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-hims-slate" />
                  <p className="text-base font-bold text-hims-dark">
                    {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="bg-hims-blue p-8 rounded-3xl text-white shadow-lg shadow-hims-blue/20">
            <ShieldCheck size={32} className="text-white/70 mb-4" />
            <h3 className="text-lg font-bold mb-2">Account Security</h3>
            <p className="text-sm text-white/70 mb-6">Manage your password and active sessions.</p>
            <button className="w-full bg-white text-hims-blue font-bold py-3 rounded-xl text-sm">
              Change Password
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <MapPin size={24} className="text-hims-slate mb-3" />
            <h3 className="text-sm font-bold text-hims-dark mb-1">Campus Location</h3>
            <p className="text-xs text-hims-slate mb-4">Higher Institute of Management Studies (HIMS), Buea</p>
            <button className="text-xs font-bold text-hims-blue hover:underline">
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;