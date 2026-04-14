import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BookOpen, Users, Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

const ManageCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    lecturerId: '',
    department: '',
    level: '',
    semester: 'Semester 1',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesData, lecturersData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getUsersByRole('LECTURER')
      ]);
      setCourses(coursesData);
      setLecturers(lecturersData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = semesterFilter === 'All Semesters' || course.semester === semesterFilter;
    const matchesStatus = statusFilter === 'All Status' || course.status === statusFilter;
    return matchesSearch && matchesSemester && matchesStatus;
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const lecturer = lecturers.find(l => l.id === newCourse.lecturerId);
    if (!lecturer) return alert('Please select a lecturer');

    try {
      await courseService.createCourse({
        code: newCourse.code,
        name: newCourse.name,
        lecturerId: newCourse.lecturerId,
        lecturerName: lecturer.name,
        department: newCourse.department,
        level: newCourse.level,
        semester: newCourse.semester,
        status: newCourse.status
      });
      setIsAdding(false);
      setNewCourse({ code: '', name: '', lecturerId: '', department: '', level: '', semester: 'Semester 1', status: 'Active' });
      fetchData();
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <DashboardLayout title="Manage Courses" breadcrumb="Review and organize academic offerings for the current session.">
      <div className="space-y-6">
        {/* Top Header Actions */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-hims-blue/20 transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
            {isAdding ? 'Cancel' : 'Add New Course'}
          </button>
        </div>

        {/* Add Course Form */}
        {isAdding && (
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-hims-dark mb-6">Create New Academic Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Course Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. SWE 301" 
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Course Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Software Engineering" 
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Assigned Lecturer</label>
                  <select 
                    required
                    value={newCourse.lecturerId}
                    onChange={(e) => setNewCourse({...newCourse, lecturerId: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Department</label>
                  <select 
                    required
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  >
                    <option value="">Select Department</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Management">Management</option>
                    <option value="Banking and Finance">Banking and Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resource Management">Human Resource Management</option>
                    <option value="Logistics and Supply Chain Management">Logistics and Supply Chain Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Level</label>
                  <select 
                    required
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  >
                    <option value="">Select Level</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Semester</label>
                  <select 
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  >
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-hims-slate mb-2 uppercase tracking-wider">Status</label>
                  <select 
                    value={newCourse.status}
                    onChange={(e) => setNewCourse({...newCourse, status: e.target.value as any})}
                    className="w-full bg-slate-50 border-none px-6 py-3.5 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-hims-blue/10"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-hims-blue text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-hims-blue/90 transition-all">
                    Register Course
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filters Container */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by course name, code, or lecturer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none pl-12 pr-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-hims-blue/10"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/10 w-full md:w-auto"
            >
              <option>All Semesters</option>
              <option>Semester 1</option>
              <option>Semester 2</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/10 w-full md:w-auto"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="p-3 bg-slate-50 rounded-2xl text-hims-slate hover:bg-slate-100">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold uppercase tracking-widest text-xs">Fetching academic catalog...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
              <BookOpen className="mb-4 text-slate-200" size={60} />
              <p className="font-bold uppercase tracking-widest text-xs">No courses matching your filters</p>
              <p className="text-xs mt-2">Adjust your search or filters to see more results.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-[#FBFCFE]">
                  <tr className="text-left">
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Course Code</th>
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Course Name</th>
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Assigned Lecturer</th>
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Semester</th>
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6 font-extrabold text-hims-blue text-sm uppercase">{course.code}</td>
                      <td className="px-8 py-6 font-extrabold text-hims-dark text-sm">{course.name}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 text-hims-blue rounded-full flex items-center justify-center text-[10px] font-bold">
                            {course.lecturerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-hims-dark/80">{course.lecturerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-hims-slate font-bold">{course.semester}</td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-extrabold px-4 py-2 rounded-lg ${
                          course.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        } uppercase tracking-wide`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-hims-slate hover:text-hims-blue hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-hims-slate hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Course Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 text-hims-blue rounded-2xl flex items-center justify-center">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Total Courses</p>
              <h4 className="text-3xl font-extrabold text-hims-dark tracking-tight">
                {isLoading ? '...' : courses.length}
              </h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Active</p>
              <h4 className="text-3xl font-extrabold text-hims-dark tracking-tight">
                {isLoading ? '...' : courses.filter(c => c.status === 'Active').length}
              </h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Lecturers</p>
              <h4 className="text-3xl font-extrabold text-hims-dark tracking-tight">
                {isLoading ? '...' : lecturers.length}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageCoursesPage;
