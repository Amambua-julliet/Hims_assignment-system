import React, { useState, useEffect } from 'react';
import { Users, User, ClipboardList, Plus, Edit2, Trash2, TrendingUp, AlertCircle, X, Loader2, Search } from 'lucide-react';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please check your Firebase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUserProfile(uid);
        setUsers(users.filter((u: UserProfile) => u.id !== uid));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const getStats = () => {
    const total = users.length;
    const students = users.filter((u: UserProfile) => u.role?.toUpperCase() === 'STUDENT').length;
    const pending = users.filter((u: UserProfile) => u.status?.toUpperCase() === 'PENDING').length;
    return { total, students, pending };
  };

  const filteredUsers = users.filter((user: UserProfile) => {
    const matchesRole = roleFilter === 'All Roles' || user.role?.toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === 'All Status' || user.status?.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.matricule?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const statsCount = getStats();

  return (
    <div className="p-0">
      <div className="space-y-6">
        {/* Top Header Actions */}
        <div className="flex justify-end mb-6">
          <button className="flex items-center gap-2 bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-hims-blue/20 transition-all">
            <Plus size={20} />
            Add New User
          </button>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mb-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Total Users</p>
                <h4 className="text-4xl font-extrabold text-hims-dark tracking-tight mt-2">
                  {isLoading ? '...' : statsCount.total}
                </h4>
              </div>
              <div className="w-14 h-14 bg-blue-50 text-hims-blue rounded-2xl flex items-center justify-center">
                <Users size={28} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-4">
              <TrendingUp size={16} />
              <span>Synced with Firestore</span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Active Students</p>
                <h4 className="text-4xl font-extrabold text-hims-dark tracking-tight mt-2">
                   {isLoading ? '...' : statsCount.students}
                </h4>
              </div>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <User size={28} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-4">
              <TrendingUp size={16} />
              <span>Real-time count</span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-hims-slate uppercase tracking-wider mb-1">Pending Approvals</p>
                <h4 className="text-4xl font-extrabold text-hims-dark tracking-tight mt-2">
                   {isLoading ? '...' : statsCount.pending}
                </h4>
              </div>
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <ClipboardList size={28} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mt-4">
              <AlertCircle size={16} />
              <span>{statsCount.pending > 0 ? '! Requires action' : 'No pending tasks'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          {/* Filters Container */}
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search name, email, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-hims-blue outline-none w-64 transition-all"
                  />
                </div>
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <span className="text-sm font-bold text-hims-slate">Filters:</span>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white border-none py-2 rounded-xl text-sm font-bold text-hims-dark cursor-pointer outline-none hover:text-hims-blue flex items-center gap-2"
                >
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Lecturer</option>
                  <option>Admin</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border-none py-2 rounded-xl text-sm font-bold text-hims-dark cursor-pointer outline-none hover:text-hims-blue flex items-center gap-2"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
             </div>
             <button 
                onClick={fetchUsers}
                className="flex items-center gap-2 text-sm font-bold text-hims-slate hover:text-hims-dark transition-colors"
              >
                <X size={16} />
                Refresh Data
             </button>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-bold uppercase tracking-widest text-xs">Loading academic data...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-rose-500">
              <AlertCircle className="mb-4" size={40} />
              <p className="font-bold text-sm">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
              <Users className="mb-4 text-slate-200" size={60} />
              <p className="font-bold uppercase tracking-widest text-xs">No users match your criteria</p>
              <p className="text-xs mt-2">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white">
                <tr className="text-left">
                  <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Name</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Email Address</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-hims-slate uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=94a3b8&color=fff`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full bg-slate-100" 
                        />
                        <div>
                          <p className="font-extrabold text-hims-dark text-sm">{user.name}</p>
                          <p className="text-xs font-semibold text-hims-slate mt-0.5">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-semibold text-hims-blue text-sm">{user.email}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-extrabold px-4 py-2 rounded-lg bg-slate-100 text-hims-dark tracking-wide uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'ACTIVE' ? 'bg-emerald-500' : 
                          user.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <span className={`text-xs font-extrabold uppercase tracking-wide ${
                          user.status === 'ACTIVE' ? 'text-emerald-500' : 
                          user.status === 'PENDING' ? 'text-amber-500' : 'text-slate-500'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 text-hims-slate opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="hover:text-hims-blue transition-colors p-2 rounded-lg hover:bg-blue-50">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
