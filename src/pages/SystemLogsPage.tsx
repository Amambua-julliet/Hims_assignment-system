import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  Activity, 
  AlertTriangle, 
  XOctagon, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const SystemLogsPage: React.FC = () => {
  const logs = [
    { timestamp: 'Oct 24, 2023 · 14:22:05', user: 'SIR TATASON', initials: 'ST', action: 'Posted Assignment', status: 'SUCCESS', ip: '192.168.1.45' },
    { timestamp: 'Oct 24, 2023 · 14:18:12', user: 'Favour Forzi', initials: 'FF', action: 'Logged In', status: 'INFO', ip: '102.13.44.112' },
    { timestamp: 'Oct 24, 2023 · 14:05:44', user: 'System Root', initials: 'SY', action: 'Database Backup Complete', status: 'SUCCESS', ip: '127.0.0.1' },
    { timestamp: 'Oct 24, 2023 · 13:52:01', user: 'MRS CAROLINE', initials: 'MC', action: 'Published Grade', status: 'SUCCESS', ip: '197.12.8.231' },
    { timestamp: 'Oct 24, 2023 · 13:45:10', user: 'John Doe', initials: 'JD', action: 'Failed Login Attempt', status: 'WARNING', ip: '41.203.111.9' },
    { timestamp: 'Oct 24, 2023 · 13:30:59', user: 'System Root', initials: 'SY', action: 'SSL Certificate Expiration', status: 'ERROR', ip: 'Internal Server' },
  ];

  return (
    <DashboardLayout title="System Logs" breadcrumb="Monitor all portal activities and administrative actions across HIMS Buea.">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-3 mb-6">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-hims-dark font-bold py-2.5 px-6 rounded-xl transition-all">
            <Download size={18} />
            Export Logs
          </button>
          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-red-500/20 transition-all">
            <Trash2 size={18} />
            Clear Logs
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-hims-blue rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-hims-slate uppercase tracking-wider mb-0.5">Total Actions</p>
              <h4 className="text-xl font-extrabold text-hims-dark">12,482</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <RefreshCw size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-hims-slate uppercase tracking-wider mb-0.5">Success Rate</p>
              <h4 className="text-xl font-extrabold text-hims-dark">99.2%</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-hims-slate uppercase tracking-wider mb-0.5">Warnings</p>
              <h4 className="text-xl font-extrabold text-hims-dark">42</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <XOctagon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-hims-slate uppercase tracking-wider mb-0.5">Errors</p>
              <h4 className="text-xl font-extrabold text-hims-dark">7</h4>
            </div>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-max">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search logs by user, action, or IP..." 
                className="w-full lg:w-96 bg-slate-50 border-none pl-12 pr-4 py-2.5 rounded-2xl text-sm focus:ring-2 focus:ring-hims-blue/10"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <select className="bg-slate-50 border-none px-4 py-2.5 rounded-xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/10 flex-1 lg:flex-none">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
              <select className="bg-slate-50 border-none px-4 py-2.5 rounded-xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/10 flex-1 lg:flex-none">
                <option>All Roles</option>
                <option>Admin</option>
                <option>Lecturer</option>
                <option>Student</option>
              </select>
              <select className="bg-slate-50 border-none px-4 py-2.5 rounded-xl text-sm font-semibold text-hims-dark focus:ring-2 focus:ring-hims-blue/10 flex-1 lg:flex-none">
                <option>All Status Levels</option>
                <option>Success</option>
                <option>Warning</option>
                <option>Error</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-hims-slate uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-5 text-sm text-hims-slate font-medium">{log.timestamp}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-hims-slate">
                          {log.initials}
                        </div>
                        <span className="text-sm font-bold text-hims-dark">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-hims-dark/80">{log.action}</td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                        log.status === 'INFO' ? 'bg-blue-50 text-blue-600' :
                        log.status === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-hims-slate font-medium">{log.ip}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-hims-blue hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-hims-slate">Showing 1 to 10 of 12,482 logs</p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-slate-200 text-hims-slate hover:bg-white disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-hims-blue text-white text-sm font-bold">1</button>
              <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-hims-slate text-sm font-bold hover:border-hims-blue/30 transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-hims-slate text-sm font-bold hover:border-hims-blue/30 transition-colors">3</button>
              <span className="px-1 text-slate-300">...</span>
              <button className="px-3 h-8 rounded-lg bg-white border border-slate-200 text-hims-slate text-sm font-bold hover:border-hims-blue/30 transition-colors">1,248</button>
              <button className="p-2 rounded-lg border border-slate-200 text-hims-slate hover:bg-white">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center py-4 flex items-center justify-center gap-2">
           <div className="w-6 h-6 bg-hims-blue/10 rounded-md flex items-center justify-center">
             <span className="text-[10px] font-bold text-hims-blue italic">HB</span>
           </div>
           <p className="text-[10px] font-bold text-hims-slate/50 uppercase tracking-[0.2em]">HIMS Buea Portal Management</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemLogsPage;
