import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  Settings, 
  CreditCard,
  PlusCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Workers', icon: <Users size={20} />, path: '/workers' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
    { name: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Embroidery Pro
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
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
        <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          <PlusCircle size={18} />
          <span>New Order</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
