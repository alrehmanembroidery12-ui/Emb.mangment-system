import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Settings as SettingsIcon, 
  Save, 
  Info, 
  TrendingUp, 
  DollarSign, 
  User, 
  Users, 
  Shield, 
  Download, 
  Trash2, 
  Plus, 
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Database
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', address: '', contact_phone: '', subscription_plan: '', subscription_status: '', trial_ends_at: '' });
  const [bonusRules, setBonusRules] = useState({ min_stitches: 0, bonus_amount: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'Operator' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profRes, bonusRes, usersRes] = await Promise.all([
        api.get('/api/settings/profile'),
        api.get('/api/settings/bonus-rules'),
        api.get('/api/settings/users')
      ]);
      setProfile(profRes.data);
      setBonusRules(bonusRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/settings/profile', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBonus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/settings/bonus-rules', bonusRules);
      setMessage({ type: 'success', text: 'Bonus rules updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update bonus rules' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/settings/users', newUser);
      setMessage({ type: 'success', text: 'User added successfully!' });
      setShowAddUser(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'Operator' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add user' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/settings/users/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/api/settings/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `embroidery_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Factory Profile', icon: <Building size={18} /> },
    { id: 'team', label: 'Team Members', icon: <Users size={18} /> },
    { id: 'bonus', label: 'Stitch Bonus', icon: <TrendingUp size={18} /> },
    { id: 'subscription', label: 'Subscription', icon: <Shield size={18} /> },
    { id: 'data', label: 'Data & Backup', icon: <Database size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your factory profile, team, and system preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-500 hover:bg-gray-900 hover:text-white border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl font-bold text-sm flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-600/10 text-green-400 border border-green-600/20' : 'bg-red-600/10 text-red-400 border border-red-600/20'}`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-gray-800 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-white">Factory Profile</h2>
                  <p className="text-gray-500 text-sm">Reports aur invoices par ye maloomat print hon gi</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Factory Name</label>
                      <div className="relative">
                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          placeholder="Factory Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Phone</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={profile.contact_phone}
                          onChange={(e) => setProfile({...profile, contact_phone: e.target.value})}
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Factory Address</label>
                      <div className="relative">
                        <MapPin size={18} className="absolute left-3 top-4 text-gray-500" />
                        <textarea 
                          rows="3"
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={profile.address}
                          onChange={(e) => setProfile({...profile, address: e.target.value})}
                          placeholder="Full Address"
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Update Profile'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Team Members</h2>
                    <p className="text-gray-500 text-sm">Apne staff ke liye system access manage karain</p>
                  </div>
                  <button onClick={() => setShowAddUser(true)} className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all border border-blue-600/20 flex items-center space-x-2 px-4 py-2">
                    <Plus size={18} />
                    <span className="font-bold">Add User</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Role</th>
                        <th className="pb-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all">
                          <td className="py-4 font-bold text-white">{u.full_name}</td>
                          <td className="py-4 text-gray-400">{u.email}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                              u.role === 'Admin' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/20' :
                              u.role === 'Manager' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20' :
                              'bg-gray-600/20 text-gray-400 border border-gray-600/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button onClick={() => handleDeleteUser(u.id)} className="text-gray-600 hover:text-red-500 transition-all p-2">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showAddUser && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 space-y-6">
                      <h3 className="text-xl font-bold text-white">Add New Team Member</h3>
                      <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                          <input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                          <input type="email" required className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                          <input type="password" required className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                          <select className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                            <option value="Manager">Manager</option>
                            <option value="Operator">Operator</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl">Cancel</button>
                          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl">{loading ? 'Adding...' : 'Create User'}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bonus' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-gray-800 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-white">Stitch Bonus Rules</h2>
                  <p className="text-gray-500 text-sm">Har factory ke liye auto-bonus configuration</p>
                </div>
                
                <form onSubmit={handleSaveBonus} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min Stitches for Bonus</label>
                      <div className="relative">
                        <TrendingUp size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="number" 
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={bonusRules.min_stitches}
                          onChange={(e) => setBonusRules({...bonusRules, min_stitches: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bonus Amount (₨)</label>
                      <div className="relative">
                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="number" 
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={bonusRules.bonus_amount}
                          onChange={(e) => setBonusRules({...bonusRules, bonus_amount: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                    <Save size={18} className="inline mr-2" />
                    <span>Save Bonus Rules</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-gray-800 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-white">Subscription & Plan</h2>
                  <p className="text-gray-500 text-sm">Manage your billing and account status</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-800">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Plan</p>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-blue-400">{profile.subscription_plan || 'Professional'}</h3>
                      <span className="bg-green-600/10 text-green-400 text-[10px] font-black px-2 py-1 rounded-md border border-green-600/20 uppercase">{profile.subscription_status}</span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-800">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Trial / Ends At</p>
                    <div className="flex items-center space-x-3">
                      <Clock size={20} className="text-gray-500" />
                      <h3 className="text-xl font-bold text-white">{profile.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString() : 'N/A'}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-3xl flex items-start space-x-4">
                  <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Upgrade your account?</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Zyada factory space, multiple locations, ya custom reporting ke liye humari support team se rabta karain.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-gray-800 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-white">Data & Backup</h2>
                  <p className="text-gray-500 text-sm">Download your data for offline backup</p>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-800 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-purple-600/20 rounded-2xl text-purple-400">
                      <Download size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Full Factory Backup</h3>
                      <p className="text-gray-400 text-sm">Download workers, orders, clients, and transaction history in JSON format.</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700/50 flex flex-col md:flex-row gap-4">
                    <button onClick={handleExportData} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2">
                      <Download size={20} />
                      <span>Download JSON Backup</span>
                    </button>
                    <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 border border-gray-700 cursor-not-allowed opacity-50">
                      <Plus size={20} />
                      <span>Connect Google Drive (Coming Soon)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-yellow-600/5 border border-yellow-600/10 rounded-2xl flex items-start space-x-3 text-yellow-500/80">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    <b>Note:</b> Backup download karne se aap ka data system se delete nahi hoga. Ye sirf aap ki hifazat ke liye ek copy hogi jo aap offline rukh saktay hain.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
