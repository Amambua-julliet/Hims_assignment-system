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
  Clock,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [searchDept, setSearchDept] = useState('');
  const [searchLevel, setSearchLevel] = useState('');
  const [searchSemester, setSearchSemester] = useState('Semester 1');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedToRegister, setSelectedToRegister] = useState<Set<string>>(new Set());
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  useEffect(() => {
    fetchDepts();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          if (profile) {
            setSearchDept(profile.department || '');
            setSearchLevel(profile.level || '');

            // Only fetch what they are explicitly registered for
            // For now, courseService.getCoursesForStudent fetches all for dept, 
            // but we filter them down locally
            if (profile.department && profile.level) {
              const fetchedCourses = await courseService.getCoursesForStudent(profile.department, profile.level);
              setCourses(fetchedCourses);
            }
          }
        } catch (err) {
          console.error("Error fetching courses data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDepts = async () => {
    try {
      const depts = await courseService.getAllDepartments();
      const standardDepts = [
        "Software Engineering", "Accounting", "Management", 
        "Banking and Finance", "Marketing", "Human Resource Management", 
        "Logistics and Supply Chain Management"
      ];
      // Merge and unique
      const combined = Array.from(new Set([...depts, ...standardDepts])).sort();
      setAvailableDepts(combined);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const registeredCourses = courses.filter(c => userProfile?.registeredCourseIds?.includes(c.id));

  const handleSearchCourses = async () => {
    if (!searchDept || !searchLevel || !searchSemester) return;
    setIsSearching(true);
    try {
      const results = await courseService.searchCoursesForRegistration(searchDept, searchLevel, searchSemester);
      // Filter out courses already registered
      const filteredResults = results.filter(c => !userProfile?.registeredCourseIds?.includes(c.id));
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Failed to search courses", err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelection = (courseId: string) => {
    const newSet = new Set(selectedToRegister);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setSelectedToRegister(newSet);
  };

  const handleSubmitRegistration = async () => {
    if (!userProfile || selectedToRegister.size === 0) return;
    setIsSubmittingReg(true);
    try {
      const idsToRegister = Array.from(selectedToRegister);
      for (const courseId of idsToRegister) {
        await userService.registerForCourse(userProfile.id, courseId);
      }
      // Update local state instantly to reflect new registrations
      setUserProfile(prev => prev ? {
        ...prev,
        registeredCourseIds: [...(prev.registeredCourseIds || []), ...idsToRegister]
      } : prev);

      // also push missing courses into main state if they searched cross-dept
      const newlyRegisteredCourses = searchResults.filter(c => idsToRegister.includes(c.id));
      setCourses(prev => [...prev, ...newlyRegisteredCourses.filter(nc => !prev.find(p => p.id === nc.id))]);

      setShowSuccess(true);
      setTimeout(() => {
        setShowRegModal(false);
        setShowSuccess(false);
        setSelectedToRegister(new Set());
        setSearchResults([]);
      }, 2000);
    } catch (err) {
      console.error("Registration failed", err);
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleSingleRegistration = async (courseId: string) => {
    if (!userProfile) return;
    setIsSubmittingReg(true);
    try {
      await userService.registerForCourse(userProfile.id, courseId);
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        registeredCourseIds: [...(prev.registeredCourseIds || []), courseId]
      } : prev);

      const registeredCourse = searchResults.find(c => c.id === courseId);
      if (registeredCourse) {
        setCourses(prev => [...prev, registeredCourse]);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowRegModal(false);
        setShowSuccess(false);
        setSearchResults([]);
      }, 1500);
    } catch (err) {
      console.error("Single registration failed", err);
    } finally {
      setIsSubmittingReg(false);
    }
  };

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
            { icon: <BookOpen size={18} />, label: 'My Courses', active: true, path: '/student-courses' },
            { icon: <Star size={18} />, label: 'My Grades', active: false, path: '/student-grades' },
            { icon: <History size={18} />, label: 'Upload History', active: false, path: '/upload-history' },
            { icon: <User size={18} />, label: 'Profile', active: false, path: '/student-profile' },
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Loading Courses</p>
          </div>
        )}

        {/* Header */}
        <header className="px-10 py-6 shrink-0 flex items-center justify-between bg-white border-b border-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search active courses..."
              className="w-full bg-[#f8fafc] border-none pl-12 pr-4 py-3 rounded-2xl text-[13px] font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="text-right">
              <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{userProfile?.department} • {userProfile?.level}</p>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 no-scrollbar">

          {/* Main Top Actions */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight">My Registered Modules</h1>
              <p className="text-[15px] font-medium text-slate-500 mt-2">You are officially enrolled in {registeredCourses.length} courses for this semester.</p>
            </div>
            <button
              onClick={() => setShowRegModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-extrabold text-[14px] flex items-center gap-3 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} />
              Register New Courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {registeredCourses.length === 0 && !isLoading && (
              <div className="col-span-full bg-white p-16 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Courses Registered</p>
                <p className="text-sm text-slate-500 mt-2">Click the "Register New Courses" button above to begin your semester.</p>
              </div>
            )}
            {registeredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col">
                <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-sm">
                      {course.code}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-100 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      Registered
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
                      <Clock size={14} />
                      {course.semester} Semester
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{course.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{course.status}</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <span className="text-xs font-bold text-slate-500">CREDITS: {course.credits}</span>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                        {course.department.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wide">
                      View Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REGISTRATION MODAL */}
        {showRegModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 font-outfit">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Register Courses</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Search and select the modules you wish to enroll in.</p>
                </div>
                <button onClick={() => setShowRegModal(false)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 flex flex-col flex-1 overflow-hidden">

                {/* Search Filters Row */}
                <div className="flex items-end gap-4 mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shrink-0">
                    <div className="flex-1">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-2">Department</label>
                      <select 
                        value={searchDept}
                        onChange={(e) => setSearchDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer"
                      >
                         <option value="">All Departments</option>
                         {availableDepts.map((dept: string) => (
                           <option key={dept} value={dept}>{dept}</option>
                         ))}
                      </select>
                    </div>
                  <div className="w-48">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-2">Academic Level</label>
                    <select
                      value={searchLevel}
                      onChange={(e) => setSearchLevel(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    >
                      <option value="">Select Level</option>
                      <option value="Level 200">Level 200</option>
                      <option value="Level 300">Level 300</option>
                      <option value="Level 400">Level 400</option>
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-2">Semester</label>
                    <select
                      value={searchSemester}
                      onChange={(e) => setSearchSemester(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl text-[14px] font-bold focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSearchCourses}
                    disabled={isSearching}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 h-[54px]"
                  >
                    {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Filter size={18} />}
                    Search
                  </button>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[300px]">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">No courses match this filter.</p>
                      <p className="text-sm mt-1">Adjust your parameters and search again.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map(course => (
                        <div
                          key={course.id}
                          onClick={() => toggleSelection(course.id)}
                          className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedToRegister.has(course.id)
                            ? 'border-blue-500 bg-blue-50/30'
                            : 'border-slate-100 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${selectedToRegister.has(course.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                            }`}>
                            {selectedToRegister.has(course.id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded md">{course.code}</span>
                              <span className="text-[11px] font-bold text-slate-400">{course.credits} Credits • {course.lecturerName}</span>
                            </div>
                            <h3 className="text-[16px] font-extrabold text-slate-900">{course.name}</h3>
                          </div>
                          
                          {/* Individual Register Button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleRegistration(course.id);
                            }}
                            disabled={isSubmittingReg}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-extrabold transition-all shadow-md shadow-blue-100 shrink-0"
                          >
                            Register
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {searchResults.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">
                      <span className="text-blue-600 font-extrabold">{selectedToRegister.size}</span> modules selected
                    </p>
                    <button
                      onClick={handleSubmitRegistration}
                      disabled={selectedToRegister.size === 0 || isSubmittingReg}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-10 py-4 rounded-2xl font-extrabold transition-all shadow-lg shadow-blue-200 flex items-center gap-3"
                    >
                      {isSubmittingReg ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Confirm Registration
                    </button>
                  </div>
                )}

                {/* Success Overlay */}
                {showSuccess && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900">Registration Successful!</h3>
                    <p className="text-slate-500 mt-2 font-medium max-w-sm">Your new modules have been added to your academic record. Redirecting...</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentCoursesPage;
