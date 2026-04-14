import React from 'react';
import { Bell, Search, Globe } from 'lucide-react';

const Header: React.FC<{ title: string; breadcrumb: string }> = ({ title, breadcrumb }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-bold text-hims-dark">{title}</h1>
        <p className="text-sm font-medium text-hims-slate">{breadcrumb}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-slate-50 border-none px-10 py-2.5 rounded-full text-sm w-64 focus:ring-2 focus:ring-hims-blue/10 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-slate-50 text-hims-slate transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2.5 rounded-full hover:bg-slate-50 text-hims-slate transition-colors">
            <Globe size={20} />
          </button>
        </div>
        
        <div className="h-8 w-px bg-slate-100 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-hims-dark group-hover:text-hims-blue transition-colors">Mrs. Caroline</p>
            <p className="text-[11px] font-medium text-hims-slate bg-slate-100 px-2 rounded-md inline-block">Admin</p>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Caroline&backgroundColor=b6e3f4" 
            alt="Avatar" 
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50 group-hover:ring-hims-blue/20 transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
