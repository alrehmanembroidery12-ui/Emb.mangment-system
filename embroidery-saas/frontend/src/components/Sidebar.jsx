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
    <div className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] h-screen flex flex-col relative flex-shrink-0 transition-colors duration-300">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tighter">
          ACRU
        </h2>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--border-color)] transition-all shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600/10 text-[var(--accent-color)] border border-blue-600/20' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)]'
            }`}
          >
            {item.icon}
            <span className="font-bold">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Quick Action Section */}
      <div className="p-4 bg-[var(--bg-input)] m-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <p className="text-[10px] text-[var(--text-muted)] uppercase font-black mb-3 px-2 tracking-widest">Quick Action</p>
        <button 
          onClick={() => window.location.href = '/orders'}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20"
        >
          <PlusCircle size={18} />
          <span>New Order</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
