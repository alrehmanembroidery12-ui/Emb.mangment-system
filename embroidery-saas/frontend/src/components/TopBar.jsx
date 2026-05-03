import React from 'react';
import { Search, Bell, UserCircle, RefreshCcw, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TopBar = () => {
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
    <div className="h-16 bg-[var(--bg-sidebar)]/80 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-[var(--text-muted)]" />
        </span>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
          placeholder="Search for orders, workers, or invoices..."
        />
      </div>

      {/* Notifications and Profile */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
           {user?.is_demo && (
             <span className="flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/50 text-xs font-bold animate-pulse">
               <AlertCircle size={14} className="mr-1" />
               DEMO ACCOUNT
             </span>
           )}
           <button 
             onClick={handleResetDemo}
             className="flex items-center px-3 py-1 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-all text-xs font-bold"
             title="Reset Data"
           >
             <RefreshCcw size={14} className="mr-1" />
             Reset Data
           </button>
        </div>

        <button className="relative text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--bg-sidebar)]"></span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-[var(--border-color)] pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-[var(--text-main)]">{user?.full_name}</p>
            <p className="text-xs text-[var(--text-muted)] capitalize font-medium">{user?.role}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 rounded-full">
            <UserCircle size={32} className="text-[var(--bg-sidebar)] bg-[var(--text-main)] rounded-full" />
          </div>
          
          <button 
            onClick={logout}
            className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
