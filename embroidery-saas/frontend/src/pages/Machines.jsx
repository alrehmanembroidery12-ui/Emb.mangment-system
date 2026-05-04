import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Edit2, Trash2, Cpu, Activity, Clock, Settings, User, AlertCircle, TrendingUp } from 'lucide-react';

const ProductionLogModal = ({ machine, workers, onClose, onSuccess }) => {
  const [logData, setLogData] = useState({
    worker_id: '',
    stitches_count: '',
    shift: 'Day',
    downtime_minutes: '',
    start_time: new Date().toISOString().split('T')[0] + 'T09:00',
    end_time: new Date().toISOString().split('T')[0] + 'T21:00'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/machines/log', {
        machine_id: machine.id,
        ...logData,
        stitches_count: Number(logData.stitches_count) || 0,
        downtime_minutes: Number(logData.downtime_minutes) || 0
      });
      alert('Production logged successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error logging production', err);
      alert('Failed to log production');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-card)] p-8 rounded-[2rem] w-full max-w-lg border border-[var(--border-color)] shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Log Production</h2>
            <p className="text-blue-500 text-xs font-bold mt-1 tracking-tight">{machine?.name}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Assign Operator</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <select 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold cursor-pointer"
                value={logData.worker_id}
                onChange={(e) => setLogData({...logData, worker_id: e.target.value})}
                required
              >
                <option value="">Select Worker...</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Stitches Count</label>
              <div className="relative">
                <TrendingUp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="number" 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-xl"
                  placeholder="Total Stitches"
                  value={logData.stitches_count}
                  onChange={(e) => setLogData({...logData, stitches_count: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Shift</label>
              <select 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold cursor-pointer"
                value={logData.shift}
                onChange={(e) => setLogData({...logData, shift: e.target.value})}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Downtime (Minutes)</label>
            <div className="relative">
              <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input 
                type="number" 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="Break or Repair time"
                value={logData.downtime_minutes}
                onChange={(e) => setLogData({...logData, downtime_minutes: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Start Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-bold"
                value={logData.start_time}
                onChange={(e) => setLogData({...logData, start_time: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">End Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-bold"
                value={logData.end_time}
                onChange={(e) => setLogData({...logData, end_time: e.target.value})}
              />
            </div>
          </div>
          <div className="bg-blue-600/5 p-5 rounded-3xl border border-blue-600/20 flex items-start space-x-3">
            <AlertCircle size={20} className="text-blue-500 mt-0.5" />
            <p className="text-[10px] text-blue-500 leading-relaxed font-black uppercase tracking-tight">
              Ye data operator ki performance aur factory ki production stats calculate kernay main madad karega.
            </p>
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all mt-4 uppercase tracking-widest text-xs"
          >
            Confirm Log Entry
          </button>
        </form>
      </div>
    </div>
  );
};

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    model_number: '',
    total_heads: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchMachines();
    fetchWorkers();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await api.get('/api/machines');
      setMachines(res.data);
    } catch (err) {
      console.error('Error fetching machines', err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/api/workers');
      setWorkers(res.data);
    } catch (err) {
      console.error('Error fetching workers', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMachine) {
        await api.put(`/api/machines/${selectedMachine.id}`, formData);
      } else {
        await api.post('/api/machines', formData);
      }
      setShowModal(false);
      fetchMachines();
      setFormData({ name: '', model_number: '', total_heads: '', status: 'Active' });
      setSelectedMachine(null);
    } catch (err) {
      console.error('Error saving machine', err);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        await api.delete(`/api/machines/${id}`);
        fetchMachines();
      } catch (err) {
        console.error('Error deleting machine', err);
      }
    }
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Machine Management</h1>
          <p className="text-[var(--text-muted)] text-xs mt-1 opacity-70">Monitor and log factory machine performance</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMachine(null);
            setFormData({ name: '', model_number: '', total_heads: '', status: 'Active' });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-[10px] uppercase tracking-widest"
        >
          <Plus size={16} />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)]">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by name or model..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl py-3 pl-12 pr-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

    {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMachines.map((machine) => (
          <div key={machine.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden hover:border-blue-500/50 transition-all group shadow-[var(--shadow)] card-hover">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500">
                  <Cpu size={32} />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedMachine(machine);
                      setFormData({ ...machine });
                      setShowModal(true);
                    }}
                    className="p-3 text-[var(--text-muted)] hover:text-blue-500 hover:bg-[var(--bg-input)] rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(machine.id)}
                    className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[var(--text-main)] mb-0.5 tracking-tight">{machine.name}</h3>
              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-4">{machine.model_number || 'No Model'}</p>
              
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest mb-1">Total Heads</p>
                  <p className="text-[var(--text-main)] font-black text-xl">{machine.total_heads}</p>
                </div>
                <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest mb-1">Status</p>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider border inline-block mt-1 ${
                    machine.status === 'Active' ? 'bg-green-600/10 text-green-500 border-green-600/20' : 
                    machine.status === 'Maintenance' ? 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20' : 
                    'bg-red-600/10 text-red-500 border-red-600/20'
                  }`}>
                    {machine.status}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedMachine(machine);
                  setShowLogModal(true);
                }}
                className="w-full bg-[var(--bg-input)] hover:bg-blue-600 hover:text-white text-[var(--text-main)] font-black py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 border border-[var(--border-color)] group-hover:border-blue-600/30 uppercase tracking-widest text-xs"
              >
                <Activity size={18} />
                <span>Log Production</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Machine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedMachine ? 'Update Machine' : 'Add New Machine'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Machine Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. SWF Machine 1"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Model Number</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. K-Series 2024"
                  value={formData.model_number}
                  onChange={(e) => setFormData({...formData, model_number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Total Heads</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.total_heads}
                    onChange={(e) => setFormData({...formData, total_heads: e.target.value})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Status</label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition-all"
                >
                  {selectedMachine ? 'Update Machine' : 'Save Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogModal && (
        <ProductionLogModal 
          machine={selectedMachine}
          workers={workers}
          onClose={() => setShowLogModal(false)}
          onSuccess={fetchMachines}
        />
      )}
    </div>
  );
};

export default Machines;
