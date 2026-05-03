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
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl scale-in-center">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Log Production</h2>
            <p className="text-blue-400 text-sm font-semibold">{machine?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Assign Operator</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={logData.worker_id}
                onChange={(e) => setLogData({...logData, worker_id: e.target.value})}
                required
              >
                <option value="">Select Worker...</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Stitches Count</label>
              <div className="relative">
                <TrendingUp size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="number" 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Total Stitches"
                  value={logData.stitches_count}
                  onChange={(e) => setLogData({...logData, stitches_count: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Shift</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={logData.shift}
                onChange={(e) => setLogData({...logData, shift: e.target.value})}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Downtime (Minutes)</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="number" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Break or Repair time"
                value={logData.downtime_minutes}
                onChange={(e) => setLogData({...logData, downtime_minutes: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Start Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                value={logData.start_time}
                onChange={(e) => setLogData({...logData, start_time: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">End Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                value={logData.end_time}
                onChange={(e) => setLogData({...logData, end_time: e.target.value})}
              />
            </div>
          </div>
          <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-600/20 flex items-start space-x-3">
            <AlertCircle size={20} className="text-blue-400 mt-0.5" />
            <p className="text-[11px] text-blue-400 leading-relaxed font-medium">
              Ye data operator ki performance aur factory ki overall production stats calculate kernay main madad karega. Baraye meherbani sahi figures enter karain.
            </p>
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all mt-4"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Machine Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and log factory machine performance</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMachine(null);
            setFormData({ name: '', model_number: '', total_heads: '', status: 'Active' });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>Add New Machine</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or model..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div key={machine.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-600/50 transition-all group shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
                  <Cpu size={24} />
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => {
                      setSelectedMachine(machine);
                      setFormData({ ...machine });
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(machine.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{machine.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{machine.model_number || 'No Model Number'}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Heads</p>
                  <p className="text-white font-bold">{machine.total_heads}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Status</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    machine.status === 'Active' ? 'bg-green-600/10 text-green-400' : 
                    machine.status === 'Maintenance' ? 'bg-yellow-600/10 text-yellow-400' : 
                    'bg-red-600/10 text-red-400'
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
                className="w-full bg-gray-800 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
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
