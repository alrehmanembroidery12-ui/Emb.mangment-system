import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Filter, AlertTriangle, Layers, Database, CheckCircle, ArrowUpRight, ArrowDownRight, History, Calendar, Hash, Tag, Settings, Edit3 } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemHistory, setItemHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    item_name: '',
    item_code: '',
    category: 'Thread',
    quantity: '',
    unit: 'Cones',
    min_stock_level: 5,
    unit_price: ''
  });

  const [transData, setTransData] = useState({
    quantity: '',
    transaction_type: 'In',
    description: '',
    bill_amount: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory', err);
    }
  };

  const fetchHistory = async (itemId) => {
    try {
      const res = await api.get(`/api/inventory/history/${itemId}`);
      setItemHistory(res.data);
    } catch (err) {
      console.error('Error fetching history', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/inventory/${selectedItem.id}`, {
          ...formData,
          quantity: Number(formData.quantity) || 0,
          unit_price: Number(formData.unit_price) || 0,
          min_stock_level: Number(formData.min_stock_level) || 0
        });
        alert('Item updated successfully!');
      } else {
        await api.post('/api/inventory', {
          ...formData,
          quantity: Number(formData.quantity) || 0,
          unit_price: Number(formData.unit_price) || 0,
          min_stock_level: Number(formData.min_stock_level) || 0
        });
        alert('Item added successfully!');
      }
      setShowModal(false);
      setIsEditing(false);
      setSelectedItem(null);
      fetchInventory();
      setFormData({ item_name: '', item_code: '', category: 'Thread', quantity: '', unit: 'Cones', min_stock_level: 5, unit_price: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data || err.message));
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      item_name: item.item_name,
      item_code: item.item_code || '',
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock_level: item.min_stock_level,
      unit_price: item.unit_price || 0
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/inventory/transaction', {
        item_id: selectedItem.id,
        ...transData,
        quantity: Number(transData.quantity) || 0,
        bill_amount: Number(transData.bill_amount) || 0
      });
      setShowTransactionModal(false);
      fetchInventory();
      setTransData({ quantity: '', transaction_type: 'In', description: '', bill_amount: '', transaction_date: new Date().toISOString().split('T')[0] });
      alert('Transaction logged successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data || err.message));
    }
  };

  const filteredItems = items.filter(item => 
    (item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.item_code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === 'All' || item.category === categoryFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Control</h1>
          <p className="text-gray-500 text-sm mt-1">Track Threads, Bobbins, and Spare Parts</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setFormData({ item_name: '', item_code: '', category: 'Thread', quantity: '', unit: 'Cones', min_stock_level: 5, unit_price: '' }); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus size={18} />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div><p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Stock Items</p><p className="text-3xl font-bold">{items.length}</p></div>
          <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400"><Database size={24} /></div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div><p className="text-gray-500 text-xs font-bold uppercase mb-1">Low Stock Alerts</p><p className="text-3xl font-bold text-red-500">{items.filter(i => parseFloat(i.quantity) <= parseFloat(i.min_stock_level)).length}</p></div>
          <div className="p-4 bg-red-600/10 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div><p className="text-gray-500 text-xs font-bold uppercase mb-1">Threads (Types)</p><p className="text-3xl font-bold text-purple-400">{items.filter(i => i.category === 'Thread').length}</p></div>
          <div className="p-4 bg-purple-600/10 rounded-2xl text-purple-400"><Tag size={24} /></div>
        </div>
      </div>

      <div className="flex gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search by Thread # or Name..." className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
        <select className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Thread">Thread (Dhaga)</option>
          <option value="Bobbin">Bobbin</option>
          <option value="Spare Parts">Spare Parts</option>
          <option value="Needles">Needles</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Item Code / Thread #</th>
              <th className="px-6 py-4">Item Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredItems.map((item) => {
              const isLow = parseFloat(item.quantity) <= parseFloat(item.min_stock_level);
              return (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-white font-bold text-lg">{item.item_code || '---'}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-tighter font-bold">Code / Number</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-gray-300 font-medium">{item.item_name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-700">{item.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-white font-bold">₨ {item.unit_price || 0}</p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Per {item.unit}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-white font-bold text-lg">{item.quantity} <span className="text-gray-500 text-xs font-normal">{item.unit}</span></p>
                  </td>
                  <td className="px-6 py-5">
                    {isLow ? <span className="text-red-500 flex items-center space-x-1"><AlertTriangle size={14} /><span className="text-xs font-bold uppercase">Low Stock</span></span> : <span className="text-green-500 flex items-center space-x-1"><CheckCircle size={14} /><span className="text-xs font-bold uppercase">Healthy</span></span>}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:bg-gray-600/10 rounded-lg" title="Edit Item"><Edit3 size={18} /></button>
                      <button onClick={() => { setSelectedItem(item); setShowTransactionModal(true); }} className="p-2 text-blue-400 hover:bg-blue-600/10 rounded-lg" title="In/Out Transaction"><Database size={18} /></button>
                      <button onClick={() => { setSelectedItem(item); fetchHistory(item.id); setShowHistoryModal(true); }} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg" title="View History"><History size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Item' : 'Add New Inventory Item'}</h2><button onClick={() => { setShowModal(false); setIsEditing(false); }} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item Code / Thread #</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 3356" value={formData.item_code} onChange={(e) => setFormData({...formData, item_code: e.target.value})} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label><select className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}><option value="Thread">Thread (Dhaga)</option><option value="Bobbin">Bobbin</option><option value="Spare Parts">Spare Parts</option><option value="Needles">Needles</option></select></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item Description / Name</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Silk Thread Blue" value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} required /></div>
                {!isEditing && (
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Initial Cones/Qty</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} /></div>
                )}
                <div className={isEditing ? 'col-span-2' : ''}><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Cones" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required /></div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit Price (₨)</label>
                  <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} />
                </div>
                <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Low Stock Alert Level</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-600/20 mt-4 transition-all">{isEditing ? 'Update Item' : 'Create Item'}</button>
            </form>
          </div>
        </div>
      )}

      {/* In/Out Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-white">Stock Transaction</h2><p className="text-purple-400 font-bold">{selectedItem?.item_code} - {selectedItem?.item_name}</p></div><button onClick={() => setShowTransactionModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              <div className="flex bg-gray-800 p-1 rounded-xl"><button type="button" onClick={() => setTransData({...transData, transaction_type: 'In'})} className={`flex-1 py-2 rounded-lg font-bold transition-all ${transData.transaction_type === 'In' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>Stock Arrival (In)</button><button type="button" onClick={() => setTransData({...transData, transaction_type: 'Out'})} className={`flex-1 py-2 rounded-lg font-bold transition-all ${transData.transaction_type === 'Out' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>Usage (Out)</button></div>
              <div className="grid grid-cols-2 gap-4">
                <div className={transData.transaction_type === 'In' ? 'col-span-1' : 'col-span-2'}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity ({selectedItem?.unit})</label>
                  <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={transData.quantity} onChange={(e) => setTransData({...transData, quantity: e.target.value})} required />
                </div>
                {transData.transaction_type === 'In' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bill Amount (₨)</label>
                    <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 outline-none" value={transData.bill_amount} onChange={(e) => setTransData({...transData, bill_amount: e.target.value})} />
                  </div>
                )}
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description / Note</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Received from Supplier X" value={transData.description} onChange={(e) => setTransData({...transData, description: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label><input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={transData.transaction_date} onChange={(e) => setTransData({...transData, transaction_date: e.target.value})} required /></div>
              <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-4 ${transData.transaction_type === 'In' ? 'bg-green-600 shadow-green-600/20' : 'bg-red-600 shadow-red-600/20'}`}>Confirm {transData.transaction_type === 'In' ? 'Arrival' : 'Usage'}</button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-white">Stock History</h2><p className="text-purple-400 font-bold">{selectedItem?.item_code} - {selectedItem?.item_name}</p></div><button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {itemHistory.map((t) => (
                <div key={t.id} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-gray-700 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${t.transaction_type === 'In' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>{t.transaction_type === 'In' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}</div>
                    <div><p className="text-white font-semibold">{t.description || (t.transaction_type === 'In' ? 'Stock Added' : 'Stock Used')}</p><p className="text-gray-500 text-xs flex items-center space-x-1 mt-0.5"><Calendar size={12} /><span>{new Date(t.transaction_date).toLocaleDateString()}</span></p></div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${t.transaction_type === 'In' ? 'text-green-500' : 'text-red-500'}`}>{t.transaction_type === 'In' ? '+' : '-'} {t.quantity} {selectedItem?.unit}</p>
                    {t.transaction_type === 'In' && parseFloat(t.bill_amount) > 0 && <p className="text-xs text-gray-500 font-bold">Bill: ₨ {t.bill_amount}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
