import React from 'react';
import { Search, Bell, UserCircle, RefreshCcw, AlertCircle, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleResetDemo = async () => {
    if (window.confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      try {
        const res = await api.post('/api/demo/reset');
        alert(res.data.message);
        window.location.reload(); // Reload to show new data
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to reset demo data');
      }
    }
  };

  return (
    <div className="h-20 bg-[var(--bg-main)]/50 backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[var(--text-muted)] hover:text-purple-500 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar - Hidden on Mobile */}
        <div className="relative w-64 lg:w-96 group hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
          </span>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all sm:text-sm"
            placeholder="Search everything..."
          />
        </div>
      </div>

      {/* Notifications and Profile */}
      <div className="flex items-center space-x-3 lg:space-x-6">
        <div className="flex items-center space-x-2 lg:space-x-3">
           {user?.is_demo && (
             <span className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black tracking-widest animate-pulse">
               <AlertCircle size={14} className="mr-2" />
               DEMO MODE
             </span>
           )}
           <button 
             onClick={handleResetDemo}
             className="flex items-center px-3 lg:px-4 py-1.5 rounded-xl bg-[var(--bg-input)] hover:bg-purple-500/10 text-[var(--text-muted)] hover:text-purple-500 border border-[var(--border-color)] hover:border-purple-500/30 transition-all text-[10px] font-black uppercase tracking-widest"
             title="Reset Data"
           >
             <RefreshCcw size={14} className="lg:mr-2" />
             <span className="hidden lg:inline">Reset</span>
           </button>
        </div>

        <div className="h-8 w-[1px] bg-[var(--border-color)] hidden sm:block"></div>

        <button className="relative text-[var(--text-muted)] hover:text-purple-500 transition-colors p-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
          <Bell size={20} />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--bg-main)]"></span>
        </button>
        
        <div className="flex items-center space-x-3 lg:space-x-4 bg-[var(--bg-input)] p-1.5 lg:pr-4 rounded-2xl border border-[var(--border-color)] hover:border-purple-500/30 transition-all group">
          <div className="bg-grad-1 p-0.5 rounded-xl shadow-lg shadow-purple-600/20">
            <div className="bg-[var(--bg-main)] rounded-[10px] p-1">
              <UserCircle size={24} className="text-purple-500" />
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-[var(--text-main)] leading-none">{user?.full_name}</p>
            <p className="text-[10px] text-[var(--text-muted)] capitalize font-bold mt-1 tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
