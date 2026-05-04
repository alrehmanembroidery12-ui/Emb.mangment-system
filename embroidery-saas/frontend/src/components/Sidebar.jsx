import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  Settings, 
  CreditCard,
  PlusCircle,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import logo from '../assets/branding/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['Admin', 'Manager', 'Operator'] },
    { name: 'Workers', icon: <Users size={20} />, path: '/workers', roles: ['Admin', 'Manager'] },
    { name: 'Machines', icon: <Cpu size={20} />, path: '/machines', roles: ['Admin', 'Manager', 'Operator'] },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders', roles: ['Admin', 'Manager', 'Operator'] },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', roles: ['Admin', 'Manager'] },
    { name: 'Billing', icon: <CreditCard size={20} />, path: '/billing', roles: ['Admin', 'Manager'] },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['Admin'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!user?.role) return false;
    const userRole = user.role.toLowerCase();
    return item.roles.some(role => {
      const r = role.toLowerCase();
      return r === userRole;
    });
  });

  return (
    <div className="w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] h-full flex flex-col relative flex-shrink-0 transition-colors duration-300">
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-white rounded-lg p-1 shadow-md overflow-hidden flex items-center justify-center">
            <img src={logo} alt="Core Logic" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight leading-none">
              Core Logic
            </h2>
            <p className="text-[8px] font-bold text-purple-500 uppercase tracking-widest mt-1">SaaS Solutions</p>
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-all border border-[var(--border-color)]"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 opacity-70">Theme</span>
          {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-purple-500" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {filteredItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all font-semibold text-[10px] uppercase tracking-widest ${
              location.pathname === item.path 
                ? 'bg-grad-1 text-white shadow-lg shadow-purple-600/20' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)] border border-transparent'
            }`}
          >
            <span className={location.pathname === item.path ? 'text-white' : 'text-purple-500'}>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Developer Credit Section - Bottom Left */}
      <div className="p-4 mt-auto">
        <div className="p-3 border-t border-[var(--border-color)] group cursor-default">
          <p className="text-[8px] text-[var(--text-muted)] uppercase font-bold mb-0.5 tracking-widest opacity-60">Developed By</p>
          <p className="text-[10px] font-bold text-[var(--text-main)] group-hover:text-purple-400 transition-colors">Husnain Raza</p>
          <p className="text-[7px] text-[var(--text-muted)] mt-0.5 opacity-40">© 2026 Core Logic Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
