import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Settings as SettingsIcon, Save, Info, TrendingUp, DollarSign } from 'lucide-react';

const Settings = () => {
  const [bonusRules, setBonusRules] = useState({
    min_stitches: 0,
    bonus_amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings/bonus-rules');
      setBonusRules(res.data);
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/settings/bonus-rules', bonusRules);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Factory Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your factory's business rules and automation</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 bg-gray-800/30 flex items-center space-x-3">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Automatic Stitch Bonus</h2>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest flex items-center space-x-2">
                    <Info size={14} className="text-blue-400" />
                    <span>Min Stitches for Bonus</span>
                  </label>
                  <div className="relative">
                    <SettingsIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="number" 
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={bonusRules.min_stitches}
                      onChange={(e) => setBonusRules({...bonusRules, min_stitches: e.target.value})}
                      placeholder="e.g. 350000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest flex items-center space-x-2">
                    <DollarSign size={14} className="text-green-400" />
                    <span>Bonus Amount (PKR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs</span>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={bonusRules.bonus_amount}
                      onChange={(e) => setBonusRules({...bonusRules, bonus_amount: e.target.value})}
                      placeholder="e.g. 500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-600/10 flex items-start space-x-4">
                <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium leading-relaxed">
                    Aap ki factory ke hisab se, jab bhi koi worker machine log enter karega, system check karega ke kya us ke stitches {bonusRules.min_stitches || '0'} se zyada hain. 
                    Har {bonusRules.min_stitches || '0'} stitches par system khud-ba-khud Rs {bonusRules.bonus_amount || '0'} ka bonus us worker ke ledger main add kar dega.
                  </p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-600/10 text-green-400 border border-green-600/20' : 'bg-red-600/10 text-red-400 border border-red-600/20'}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
