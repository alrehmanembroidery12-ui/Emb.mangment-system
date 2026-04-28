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
    <div className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40 ml-64">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </span>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
          placeholder="Search for orders, workers, or invoices..."
        />
      </div>

      {/* Notifications and Profile */}
      <div className="flex items-center space-x-6">
        {user?.is_demo && (
          <div className="flex items-center space-x-2">
             <span className="flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/50 text-xs font-bold animate-pulse">
               <AlertCircle size={14} className="mr-1" />
               DEMO ACCOUNT
             </span>
             <button 
               onClick={handleResetDemo}
               className="flex items-center px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all text-xs"
               title="Reset Demo Data"
             >
               <RefreshCcw size={14} className="mr-1" />
               Reset
             </button>
          </div>
        )}

        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 rounded-full">
            <UserCircle size={32} className="text-gray-900 bg-gray-100 rounded-full" />
          </div>
          
          <button 
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
