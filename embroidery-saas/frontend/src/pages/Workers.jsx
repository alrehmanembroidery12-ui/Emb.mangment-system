import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, Plus, Edit2, MoreVertical, Trash2, History, Wallet, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerTransactions, setWorkerTransactions] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', salary_type: 'Fixed', base_salary: '', bonus: '', advance: '' });
  const [transData, setTransData] = useState({ amount: '', type: 'Credit', description: 'Daily Performance Bonus', date: new Date().toISOString().split('T')[0] });
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());
  const [loadingSalary, setLoadingSalary] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    let result = workers;
    if (searchTerm) {
      result = result.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.phone.includes(searchTerm));
    }
    if (filterType !== 'All') {
      result = result.filter(w => w.salary_type === filterType);
    }
    setFilteredWorkers(result);
  }, [searchTerm, filterType, workers]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/api/workers');
      setWorkers(res.data);
      setFilteredWorkers(res.data);
    } catch (err) {
      console.error('Error fetching workers', err);
    }
  };

  const fetchTransactions = async (workerId, month, year) => {
    try {
      const m = month || historyMonth;
      const y = year || historyYear;
      const res = await api.get(`/api/transactions/${workerId}?month=${m}&year=${y}`);
      setWorkerTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleGenerateSalary = async () => {
    if (!window.confirm(`Are you sure you want to generate salaries for ALL workers for ${new Date(historyYear, historyMonth - 1).toLocaleString('default', { month: 'long' })} ${historyYear}?`)) {
      return;
    }

    setLoadingSalary(true);
    try {
      await api.post('/api/workers/generate-salary', {
        month: historyMonth,
        year: historyYear
      });
      alert('Salaries generated successfully!');
      fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating salaries');
    } finally {
      setLoadingSalary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedWorker) {
        await api.put(`/api/workers/${selectedWorker.id}`, {
          ...formData,
          base_salary: Number(formData.base_salary) || 0,
          bonus: Number(formData.bonus) || 0,
          advance: Number(formData.advance) || 0
        });
      } else {
        await api.post('/api/workers', {
          ...formData,
          base_salary: Number(formData.base_salary) || 0,
          bonus: Number(formData.bonus) || 0,
          advance: Number(formData.advance) || 0
        });
      }
      setShowModal(false);
      fetchWorkers();
      setFormData({ name: '', phone: '', salary_type: 'Fixed', base_salary: '', bonus: '', advance: '' });
      setSelectedWorker(null);
    } catch (err) {
      console.error('Error saving worker', err);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/transactions', {
        worker_id: selectedWorker.id,
        amount: Number(transData.amount) || 0,
        transaction_type: transData.type,
        description: transData.description,
        transaction_date: transData.date
      });
      setShowTransactionModal(false);
      fetchWorkers();
      setTransData({ amount: '', type: 'Credit', description: 'Daily Performance Bonus', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error('Error adding transaction', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Worker Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your factory workforce and salary settings</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleGenerateSalary}
            disabled={loadingSalary}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
              loadingSalary ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
            }`}
          >
            <Wallet size={18} />
            <span>{loadingSalary ? 'Processing...' : 'Generate Monthly Salary'}</span>
          </button>
          <button 
            onClick={() => {
              setSelectedWorker(null);
              setFormData({ name: '', phone: '', salary_type: 'Fixed', base_salary: '', bonus: '', advance: '' });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            <span>Add New Worker</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Fixed">Fixed Salary</option>
            <option value="Piece-rate">Piece-rate</option>
          </select>
          <button className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Workers Grid/Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Worker Info</th>
              <th className="px-6 py-4">Salary Type</th>
              <th className="px-6 py-4">Salary</th>
              <th className="px-6 py-4">Total Bonus</th>
              <th className="px-6 py-4">Total Advance</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} className="hover:bg-gray-800/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-blue-400">
                      {worker.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{worker.name}</p>
                      <p className="text-gray-500 text-xs">{worker.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    worker.salary_type === 'Fixed' ? 'bg-blue-600/10 text-blue-400' : 'bg-purple-600/10 text-purple-400'
                  }`}>
                    {worker.salary_type}
                  </span>
                </td>
                <td className="px-6 py-5 font-medium text-white">₨ {worker.base_salary}</td>
                <td className="px-6 py-5 font-medium text-green-400">₨ {worker.total_bonus || 0}</td>
                <td className="px-6 py-5 font-medium text-red-400">₨ {worker.total_advance || 0}</td>
                <td className="px-6 py-5 font-bold text-blue-400">₨ {worker.balance || 0}</td>
                <td className="px-6 py-5">
                  <span className={`flex items-center space-x-1.5 ${worker.is_active ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${worker.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                    <span className="text-xs font-bold uppercase">{worker.is_active ? 'Active' : 'Inactive'}</span>
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { 
                        setSelectedWorker(worker); 
                        fetchTransactions(worker.id, historyMonth, historyYear); 
                        setShowHistoryModal(true); 
                      }}
                      className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg"
                      title="View History"
                    >
                      <History size={16} />
                    </button>
                    <button 
                      onClick={() => { setSelectedWorker(worker); setShowTransactionModal(true); }}
                      className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"
                      title="Quick Bonus/Advance"
                    >
                      <Wallet size={16} />
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedWorker(worker); 
                        setFormData({
                          ...worker,
                          bonus: '',
                          advance: ''
                        }); 
                        setShowModal(true); 
                      }}
                      className="p-2 text-blue-400 hover:bg-blue-600/10 rounded-lg"
                      title="Edit Worker"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedWorker ? 'Update Worker' : 'New Worker'}</h2>
              <button onClick={() => {setShowModal(false); setSelectedWorker(null);}} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Worker Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Muhammad Ali"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0300-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Salary Type</label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.salary_type}
                    onChange={(e) => setFormData({...formData, salary_type: e.target.value})}
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Piece-rate">Piece-rate</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base Salary (₨)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => {setShowModal(false); setSelectedWorker(null);}}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition-all"
                >
                  {selectedWorker ? 'Update Worker' : 'Save Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Transaction Modal (Bonus/Advance with Date) */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Transaction</h2>
                <p className="text-blue-400 text-sm">{selectedWorker?.name}</p>
              </div>
              <button onClick={() => setShowTransactionModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transaction Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setTransData({...transData, type: 'Credit', description: 'Daily Performance Bonus'})}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${
                      transData.type === 'Credit' ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'bg-gray-800 text-gray-500 border border-transparent'
                    }`}
                  >
                    <ArrowUpCircle size={18} />
                    <span>Bonus</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTransData({...transData, type: 'Debit', description: 'Salary Advance'})}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${
                      transData.type === 'Debit' ? 'bg-red-600/20 text-red-400 border border-red-600/50' : 'bg-gray-800 text-gray-500 border border-transparent'
                    }`}
                  >
                    <ArrowDownCircle size={18} />
                    <span>Advance</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount (₨)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={transData.amount}
                    onChange={(e) => setTransData({...transData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={transData.description}
                    onChange={(e) => setTransData({...transData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="date" 
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={transData.date}
                      onChange={(e) => setTransData({...transData, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-4 ${
                  transData.type === 'Credit' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                Confirm {transData.type === 'Credit' ? 'Bonus' : 'Advance'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-2xl border border-gray-800 shadow-2xl scale-in-center overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-blue-400 font-semibold">{selectedWorker?.name}</p>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center space-x-2">
                    <select 
                      className="bg-transparent text-gray-400 text-sm outline-none cursor-pointer hover:text-white transition-colors"
                      value={historyMonth}
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setHistoryMonth(m);
                        fetchTransactions(selectedWorker.id, m, historyYear);
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-gray-900">
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="bg-transparent text-gray-400 text-sm outline-none cursor-pointer hover:text-white transition-colors"
                      value={historyYear}
                      onChange={(e) => {
                        const y = parseInt(e.target.value);
                        setHistoryYear(y);
                        fetchTransactions(selectedWorker.id, historyMonth, y);
                      }}
                    >
                      {[2025, 2026, 2027].map(y => (
                        <option key={y} value={y} className="bg-gray-900">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {workerTransactions.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workerTransactions.map((t) => (
                    <div key={t.id} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-gray-700 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${t.transaction_type === 'Credit' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                          {t.transaction_type === 'Credit' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{t.description}</p>
                          <p className="text-gray-500 text-xs flex items-center space-x-1 mt-0.5">
                            <Calendar size={12} />
                            <span>{new Date(t.transaction_date).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${t.transaction_type === 'Credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.transaction_type === 'Credit' ? '+' : '-'} ₨ {t.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
