import React, { useState } from 'react';
import { User, Lock, Eye, ArrowRight, HelpCircle, ShieldCheck, MapPin, CheckCircle2, Mail, BadgeCheck, Loader2, ChevronDown, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'LECTURER' | 'ADMIN'>('STUDENT');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) {
      setError('Please agree to the Terms of Service.');
      return;
    }
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const prefix = role === 'STUDENT' ? 'ST' : role === 'LECTURER' ? 'LC' : 'AD';
      const generatedMatricule = `${prefix}${currentYear}${randomNum}`;

      // 2. Create User Profile in Firestore
      const newProfile: UserProfile = {
        id: user.uid,
        name: fullName,
        email: email,
        role: role,
        matricule: generatedMatricule,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      await userService.createUserProfile(newProfile);

      // 3. Sign out and redirect to login
      await signOut(auth);
      navigate('/login');

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'STUDENT', label: 'Student', icon: <GraduationCap size={16} />, desc: 'Access courses and submit assignments' },
    { value: 'LECTURER', label: 'Lecturer', icon: <Briefcase size={16} />, desc: 'Manage courses and grade submissions' },
    { value: 'ADMIN', label: 'Admin', icon: <Shield size={16} />, desc: 'System management and oversight' }
  ];

  const selectedRole = roles.find(r => r.value === role);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-outfit bg-white overflow-hidden">
      {/* Left Section - Hero */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex-1 hidden md:flex flex-col justify-between p-12 text-white overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hims-blue/60 via-hims-dark/40 to-hims-dark/90 z-10" />

        <div className="relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-xl">
              <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                <div className="bg-hims-blue rounded-sm"></div>
                <div className="bg-hims-blue/20 rounded-sm"></div>
                <div className="bg-hims-blue/20 rounded-sm"></div>
                <div className="bg-hims-blue rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">HIMS BUEA</span>
          </div>
        </div>

        <div className="relative z-20 mt-auto mb-12 max-w-xl">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
          >
            Join <br />
            <span className="text-white/90">ACADSUBMIT</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/80 font-normal leading-relaxed mb-8 border-l-2 border-white/30 pl-6"
          >
            Start your journey with HIMS Buea today. Access world-class management education and tools.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm">
              <MapPin size={16} />
              <span>Buea, Cameroon</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm">
              <CheckCircle2 size={16} />
              <span>Accredited Institution</span>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 text-[10px] tracking-[0.3em] font-bold text-white/50 uppercase">
          Higher Institute of Management Studies
        </div>
      </motion.div>

      {/* Right Section - Signup Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-white overflow-y-auto no-scrollbar"
      >
        <div className="w-full max-w-md my-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-hims-dark mb-3">Create Account</h2>
            <p className="text-hims-slate text-lg leading-relaxed">
              Join the HIMS community and manage your academic success.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <HelpCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-hims-dark/80 block ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate transition-colors group-focus-within:text-hims-blue">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-hims-blue focus:ring-1 focus:ring-hims-blue transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-hims-dark/80 block ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate transition-colors group-focus-within:text-hims-blue">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hims.edu"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-hims-blue focus:ring-1 focus:ring-hims-blue transition-all outline-none"
                />
              </div>
            </div>

            {/* Role Selection Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-hims-dark/80 block ml-1">
                Account Role
              </label>
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-hims-blue/50 transition-all outline-none group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-hims-blue/10 text-hims-blue flex items-center justify-center">
                    {selectedRole?.icon}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-hims-dark">{selectedRole?.label}</span>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-hims-slate transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showRoleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 left-0 right-0 mt-2 p-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-hims-dark/10"
                  >
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setRole(r.value as any);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all mb-1 last:mb-0 text-left ${
                          role === r.value ? 'bg-hims-blue/5 border-hims-blue/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          role === r.value ? 'bg-hims-blue text-white' : 'bg-slate-100 text-hims-slate'
                        }`}>
                          {r.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${role === r.value ? 'text-hims-blue' : 'text-hims-dark'}`}>
                            {r.label}
                          </p>
                          <p className="text-xs text-hims-slate">{r.desc}</p>
                        </div>
                        {role === r.value && (
                          <CheckCircle2 size={16} className="ml-auto text-hims-blue" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-hims-dark/80 block ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate transition-colors group-focus-within:text-hims-blue">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-hims-blue focus:ring-1 focus:ring-hims-blue transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-hims-slate hover:text-hims-blue transition-colors"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1 py-1">
              <input 
                type="checkbox" 
                id="terms" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded-md border-slate-300 text-hims-blue focus:ring-hims-blue transition-all cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs font-medium text-hims-slate cursor-pointer select-none leading-relaxed">
                I agree to the <a href="#" className="text-hims-blue font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-hims-blue font-bold hover:underline">Privacy Policy</a>
              </label>
            </div>

            <motion.button 
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              disabled={isLoading}
              className={`w-full bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-hims-blue/30 flex items-center justify-center gap-2 transition-all duration-200 mt-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-hims-slate font-medium">
              Already have an account? <Link to="/login" className="text-hims-blue font-bold hover:underline">Sign In here</Link>
            </p>
          </div>

          <div className="mt-10 flex justify-center gap-8 text-sm font-semibold text-hims-slate/60">
            <a href="#" className="flex items-center gap-2 hover:text-hims-blue transition-colors">
              <HelpCircle size={16} />
              Help Center
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-hims-blue transition-colors">
              <ShieldCheck size={16} />
              Privacy Policy
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
