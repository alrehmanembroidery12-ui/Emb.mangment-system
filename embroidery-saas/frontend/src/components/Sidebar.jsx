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
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

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
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col relative flex-shrink-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Embroidery Pro
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Quick Action Section */}
      <div className="p-4 bg-gray-800/50 m-4 rounded-2xl border border-gray-700">
        <p className="text-xs text-gray-500 uppercase font-bold mb-3 px-2">Quick Action</p>
        <button 
          onClick={() => window.location.href = '/orders'}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} />
          <span>New Order</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
