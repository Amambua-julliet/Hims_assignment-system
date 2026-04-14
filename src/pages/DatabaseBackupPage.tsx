import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Database, Clock, Cloud, CheckCircle2, RefreshCw, Filter, Search, Download, Info, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const DatabaseBackupPage: React.FC = () => {
  const backupHistory = [
    { id: 1, filename: 'hims_db_20231027_0200.sql.gz', date: 'Oct 27, 2023 02:00 AM', size: '412.5 MB', status: 'SUCCESS' },
    { id: 2, filename: 'hims_db_20231026_0200.sql.gz', date: 'Oct 26, 2023 02:00 AM', size: '411.8 MB', status: 'SUCCESS' },
    { id: 3, filename: 'hims_db_20231025_manual.sql.gz', date: 'Oct 25, 2023 04:15 PM', size: '409.2 MB', status: 'FAILED' },
    { id: 4, filename: 'hims_db_20231024_0200.sql.gz', date: 'Oct 24, 2023 02:00 AM', size: '408.7 MB', status: 'SUCCESS' },
  ];

  return (
    <DashboardLayout title="Database Backup" breadcrumb="Manage and monitor HIMS Buea system backups">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex justify-end gap-3 mb-6">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-hims-dark font-bold py-2.5 px-6 rounded-xl transition-all">
            <RefreshCw size={18} />
            Sync Cloud
          </button>
          <button className="flex items-center gap-2 bg-hims-blue hover:bg-hims-blue/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-hims-blue/20 transition-all">
            <Cloud size={18} />
            Start Manual Backup
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Health: 100%</span>
            </div>
            <p className="text-sm font-semibold text-hims-slate mb-1">Last Backup Status</p>
            <h3 className="text-2xl font-bold text-hims-dark">Successful</h3>
            <p className="text-xs text-hims-slate mt-2 flex items-center gap-1">
              <Clock size={12} />
              Completed 2 hours ago
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 bg-blue-50 text-hims-blue rounded-2xl flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <p className="text-sm font-semibold text-hims-slate mb-1">Next Scheduled Backup</p>
            <h3 className="text-2xl font-bold text-hims-dark">Tomorrow, 02:00 AM</h3>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                className="h-full bg-hims-blue"
              />
            </div>
            <p className="text-[10px] font-bold text-hims-slate mt-2 uppercase tracking-wide">Countdown: 14H 22M</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group text-hims-dark">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Cloud size={24} />
            </div>
            <p className="text-sm font-semibold text-hims-slate mb-1">Cloud Storage Usage</p>
            <h3 className="text-2xl font-bold">4.2 GB / 10 GB</h3>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 w-[42%]"></div>
            </div>
            <p className="text-[10px] font-bold text-hims-slate mt-2 uppercase tracking-wide">42% USED (5.8 GB REMAINING)</p>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-hims-slate">
                <Settings size={18} />
              </div>
              <h3 className="font-bold text-hims-dark">Backup Configuration</h3>
            </div>
            <button className="text-sm font-bold text-hims-blue hover:underline">Save Changes</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-hims-dark/80">Backup Frequency</label>
              <select className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-hims-blue/20">
                <option>Daily (Every night at 02:00 AM)</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-hims-dark/80">Retention Policy</label>
              <div className="flex items-center gap-3">
                <input type="number" defaultValue={30} className="w-20 bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                <span className="text-sm text-hims-slate font-medium">Backups to keep</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-hims-dark/80">Notification Email</label>
              <input type="email" defaultValue="admin.caroline@himsbuea.edu" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-hims-slate">
                <Clock size={18} />
              </div>
              <h3 className="font-bold text-hims-dark">Backup History</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  className="bg-slate-50 border-none pl-10 pr-4 py-2 rounded-xl text-sm w-64 focus:ring-2 focus:ring-hims-blue/10"
                />
              </div>
              <button className="p-2 bg-slate-50 rounded-xl text-hims-slate hover:bg-slate-100">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {backupHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-hims-blue rounded-lg flex items-center justify-center">
                          <Database size={16} />
                        </div>
                        <span className="text-sm font-bold text-hims-dark">{item.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-hims-slate font-medium">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-hims-slate font-medium">{item.size}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center w-fit gap-1.5 ${
                        item.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SUCCESS' ? 'bg-green-600' : 'bg-red-600 animate-pulse'}`}></div>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-hims-blue hover:bg-blue-50 rounded-lg">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-hims-slate hover:bg-slate-100 rounded-lg">
                          <Info size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseBackupPage;
