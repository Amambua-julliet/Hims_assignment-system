import React, { useState } from 'react';
import { User, Lock, Eye, ArrowRight, HelpCircle, ShieldCheck, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFriendlyError = (err: any): string => {
    const code: string = err?.code || '';
    const msg: string = err?.message || '';

    if (code === 'unavailable' || msg.includes('client is offline')) {
      return 'Connection failed. Please check your internet connection and try again.';
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Incorrect email or password. Please try again.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Please wait a few minutes and try again.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet connection.';
    }
    if (code === 'auth/user-disabled') {
      return 'Your account has been disabled. Please contact the administrator.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Fetch user role from Firestore (more resilient to network hiccups)
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (firestoreErr: any) {
        console.error('Firestore fetch error:', firestoreErr);
        setError(getFriendlyError(firestoreErr));
        setIsLoading(false);
        return;
      }

      // Step 3: Route based on role
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        if (role === 'ADMIN') {
          navigate('/dashboard');
        } else if (role === 'LECTURER') {
          navigate('/lecturer-dashboard');
        } else if (role === 'STUDENT') {
          navigate('/student-dashboard');
        } else {
          setError('User role not recognized. Please contact the system administrator.');
        }
      } else {
        setError('User profile not found. Your account may not have completed setup — please contact the administrator.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-outfit bg-white overflow-hidden">
      {/* Left Section - Hero */}
      <motion.div
        initial={{ opacity: 1, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex-1 hidden md:flex flex-col justify-between p-12 text-white overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hims-blue/60 via-hims-dark/40 to-hims-dark/90 z-10" />

        {/* Logo & Content */}
        <div className="relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
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
            Welcome to <br />
            <span className="text-white/90">ACADSUBMIT</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/80 font-normal leading-relaxed mb-8 border-l-2 border-white/30 pl-6"
          >
            Excellence in Management Studies. Empowering the next generation of African leaders in Buea, Cameroon.
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

      {/* Right Section - Login Form */}
      <motion.div
        initial={{ opacity: 1, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white"
      >
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-hims-dark mb-3">Sign In</h2>
            <p className="text-hims-slate text-lg leading-relaxed">
              Enter your credentials to access your academic portal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-hims-dark/80 block ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hims-slate transition-colors group-focus-within:text-hims-blue">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@hims.edu"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-hims-blue focus:ring-1 focus:ring-hims-blue transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-hims-dark/80">
                  Password
                </label>
                <a href="#" className="text-sm font-bold text-hims-blue hover:underline">
                  Forgot Password?
                </a>
              </div>
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

            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded-md border-slate-300 text-hims-blue focus:ring-hims-blue transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-medium text-hims-slate cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-hims-blue/30 flex items-center justify-center gap-2 transition-all duration-200 mt-4 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In to Portal</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-hims-slate font-medium">
              New to HIMS? <Link to="/signup" className="text-hims-blue font-bold hover:underline">Create an account</Link>
            </p>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-sm font-semibold text-hims-slate/60">
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

export default LoginPage;
