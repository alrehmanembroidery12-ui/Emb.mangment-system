import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Clock, CheckCircle, Package, AlertCircle, Eye, UserPlus, BookOpen, Receipt, Phone, Store, Wallet, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clientTransactions, setClientTransactions] = useState([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    order_number: '',
    total_price: '',
    advance_paid: '',
    production_cost: '',
    fabric_quantity: '',
    due_date: ''
  });
  
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientData, setClientData] = useState({ name: '', shop_name: '', phone: '', address: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', description: 'Balance Payment', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders', err);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Error fetching clients', err);
    }
  };

  const fetchClientTransactions = async (clientId) => {
    try {
      const res = await api.get(`/api/client-transactions/${clientId}`);
      setClientTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/orders', {
        ...formData,
        total_price: Number(formData.total_price) || 0,
        advance_paid: Number(formData.advance_paid) || 0,
        production_cost: Number(formData.production_cost) || 0,
        fabric_quantity: Number(formData.fabric_quantity) || 0
      });
      setShowModal(false);
      fetchOrders();
      fetchClients();
      setFormData({ client_id: '', order_number: '', total_price: '', advance_paid: '', production_cost: '', fabric_quantity: '', due_date: '' });
      alert('Order created successfully!');
    } catch (err) {
      console.error('Order creation error:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('Error creating order: ' + errorMsg);
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/clients', clientData);
      setShowClientModal(false);
      fetchClients();
      setClientData({ name: '', shop_name: '', phone: '', address: '' });
      alert('Client added successfully!');
    } catch (err) {
      alert('Error adding client: ' + (err.response?.data || err.message));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/client-transactions', {
        client_id: selectedClient.id,
        amount: Number(paymentData.amount) || 0,
        transaction_type: 'Credit',
        description: paymentData.description,
        transaction_date: paymentData.date
      });
      setShowPaymentModal(false);
      fetchClients();
      fetchOrders();
      alert('Payment recorded successfully!');
    } catch (err) {
      alert('Error adding payment: ' + (err.response?.data || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-600/10 text-yellow-500';
      case 'In-Production': return 'bg-blue-600/10 text-blue-400';
      case 'Completed': return 'bg-green-600/10 text-green-500';
      case 'Delivered': return 'bg-purple-600/10 text-purple-400';
      case 'Cancelled': return 'bg-red-600/10 text-red-500';
      default: return 'bg-gray-600/10 text-gray-400';
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
     order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || order.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage production, fabric (gazana), and client ledger</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => {
            setClientData({ name: '', shop_name: '', phone: '', address: '' });
            setShowClientModal(true);
          }} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all"><UserPlus size={18} /><span>Add Client</span></button>
          <button onClick={() => {
            setFormData({ client_id: '', order_number: '', total_price: '', advance_paid: '', production_cost: '', fabric_quantity: '', due_date: '' });
            setClientSearchTerm('');
            setShowModal(true);
          }} className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20"><Plus size={18} /><span>New Order</span></button>
        </div>
      </div>

      <div className="flex gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search by Order #, Client, or Shop..." className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
        <select className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In-Production">In Production</option>
          <option value="Completed">Completed</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Order & Gazana</th>
              <th className="px-6 py-4">Client & Shop</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Bill Details</th>
              <th className="px-6 py-4">Client Balance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredOrders.map((order) => {
              const client = clients.find(c => c.id === order.client_id);
              return (
                <tr key={order.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-white font-bold">{order.order_number}</p>
                    <div className="flex items-center space-x-1.5 text-gray-500 text-xs mt-1"><BookOpen size={12} /><span>{order.fabric_quantity} Gaz</span></div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <p className="text-gray-300 font-bold">{order.client_name || 'Walking Customer'}</p>
                      <div className="flex items-center space-x-1.5 text-gray-500 text-xs mt-0.5"><Store size={12} /><span>{order.shop_name || 'No Shop'}</span></div>
                      <div className="flex items-center space-x-1.5 text-gray-500 text-xs"><Phone size={12} /><span>{order.phone || 'No Phone'}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-6 py-5"><p className="text-white font-bold">₨ {order.total_price}</p><p className="text-green-500 text-xs">Adv: ₨ {order.advance_paid}</p></td>
                  <td className="px-6 py-5">
                    <p className={`text-lg font-bold ${parseFloat(client?.balance) > 0 ? 'text-red-500' : 'text-green-500'}`}>₨ {client?.balance || 0}</p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Total Pending</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-1">
                      <button onClick={() => { setSelectedClient(client); setShowPaymentModal(true); }} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg" title="Add Payment"><Wallet size={16} /></button>
                      <button onClick={() => { setSelectedClient(client); fetchClientTransactions(client.id); setShowLedgerModal(true); }} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg" title="View Ledger"><Receipt size={16} /></button>
                      <button onClick={() => { setSelectedOrder(order); setShowOrderDetailsModal(true); }} className="p-2 text-blue-400 hover:bg-blue-600/10 rounded-lg" title="View Order"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-lg border border-gray-800 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">Create New Order</h2><button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order Number</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. ORD-1001" value={formData.order_number} onChange={(e) => setFormData({...formData, order_number: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Client</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search client by name or phone..." 
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                      />
                    </div>
                    <select 
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.client_id} 
                      onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {clients
                        .filter(c => {
                          if (!c.name) return false;
                          const nameMatch = c.name.toLowerCase().includes(clientSearchTerm.toLowerCase());
                          const shopMatch = c.shop_name ? c.shop_name.toLowerCase().includes(clientSearchTerm.toLowerCase()) : false;
                          const phoneMatch = c.phone ? c.phone.includes(clientSearchTerm) : false;
                          return nameMatch || shopMatch || phoneMatch;
                        })
                        .map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.shop_name ? `(${client.shop_name})` : ''} - {client.phone || 'No Phone'}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gazana (Meters)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fabric_quantity} onChange={(e) => setFormData({...formData, fabric_quantity: e.target.value})} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Total Bill (₨)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.total_price} onChange={(e) => setFormData({...formData, total_price: e.target.value})} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Advance (₨)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.advance_paid} onChange={(e) => setFormData({...formData, advance_paid: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cost (₨)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.production_cost} onChange={(e) => setFormData({...formData, production_cost: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Due Date</label><input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required /></div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition-all mt-4">Create Order & Generate Bill</button>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Detailed Client Ledger</h2>
                <p className="text-blue-400 font-semibold">{selectedClient?.name} - {selectedClient?.shop_name}</p>
              </div>
              <button onClick={() => setShowLedgerModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>

            {/* Ledger Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Billed</p>
                <p className="text-red-500 text-xl font-bold">₨ {clientTransactions.filter(t => t.transaction_type === 'Debit').reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Received</p>
                <p className="text-green-500 text-xl font-bold">₨ {clientTransactions.filter(t => t.transaction_type === 'Credit').reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800 border-blue-500/30 shadow-lg shadow-blue-500/5">
                <p className="text-blue-400 text-xs font-bold uppercase mb-1">Current Balance</p>
                <p className="text-white text-xl font-bold">₨ {parseFloat(selectedClient?.balance).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <div className="col-span-5">Transaction Details</div>
                <div className="col-span-3 text-right">Debit (+)</div>
                <div className="col-span-2 text-right">Credit (-)</div>
                <div className="col-span-2 text-right">Balance</div>
              </div>
              
              {[...clientTransactions].reverse().reduce((acc, t, i) => {
                const prevBalance = i === 0 ? 0 : acc[i-1].runningBalance;
                const balance = t.transaction_type === 'Debit' ? prevBalance + parseFloat(t.amount) : prevBalance - parseFloat(t.amount);
                acc.push({ ...t, runningBalance: balance });
                return acc;
              }, []).reverse().map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-4 bg-gray-800/30 rounded-xl border border-gray-800 items-center hover:border-gray-700 transition-all">
                  <div className="col-span-5">
                    <p className="text-white font-semibold text-sm">{t.description}</p>
                    <p className="text-gray-500 text-[10px] flex items-center space-x-1 mt-0.5"><Calendar size={10} /><span>{new Date(t.transaction_date).toLocaleDateString()}</span></p>
                  </div>
                  <div className="col-span-3 text-right">
                    {t.transaction_type === 'Debit' ? (
                      <span className="text-red-500 font-bold text-sm">₨ {parseFloat(t.amount).toLocaleString()}</span>
                    ) : <span className="text-gray-600">-</span>}
                  </div>
                  <div className="col-span-2 text-right">
                    {t.transaction_type === 'Credit' ? (
                      <span className="text-green-500 font-bold text-sm">₨ {parseFloat(t.amount).toLocaleString()}</span>
                    ) : <span className="text-gray-600">-</span>}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`font-bold text-sm ${t.runningBalance > 0 ? 'text-white' : 'text-green-400'}`}>
                      ₨ {t.runningBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">End of Ledger Statement</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-white">Order Details</h2><p className="text-blue-400 text-sm">#{selectedOrder?.order_number}</p></div><button onClick={() => setShowOrderDetailsModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Client:</span><span className="text-white font-semibold">{selectedOrder?.client_name}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Shop:</span><span className="text-white font-semibold">{selectedOrder?.shop_name}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Gazana:</span><span className="text-white font-semibold">{selectedOrder?.fabric_quantity} Meters</span></div>
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Total Bill:</span><span className="text-white font-bold">₨ {selectedOrder?.total_price}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Advance:</span><span className="text-green-500 font-bold">₨ {selectedOrder?.advance_paid}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-500">Due Date:</span><span className="text-white">{new Date(selectedOrder?.due_date).toLocaleDateString()}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Status:</span><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder?.status)}`}>{selectedOrder?.status}</span></div>
            </div>
            <button onClick={() => setShowOrderDetailsModal(false)} className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold text-white mt-6 transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-white">Record Payment</h2><p className="text-blue-400 text-sm">{selectedClient?.name}</p></div><button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount Paid (₨)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-green-500 outline-none" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={paymentData.description} onChange={(e) => setPaymentData({...paymentData, description: e.target.value})} required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label><input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} required /></div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold text-white shadow-lg shadow-green-600/20 transition-all mt-4">Confirm Payment</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">Add New Client</h2><button onClick={() => setShowClientModal(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button></div>
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Sheikh Zahid" value={clientData.name} onChange={(e) => setClientData({...clientData, name: e.target.value})} required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Shop Name</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Zahid Embroidery Store" value={clientData.shop_name} onChange={(e) => setClientData({...clientData, shop_name: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0300-1234567" value={clientData.phone} onChange={(e) => setClientData({...clientData, phone: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address</label><textarea className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Shop address..." value={clientData.address} onChange={(e) => setClientData({...clientData, address: e.target.value})}></textarea></div>
              <button type="submit" className="w-full bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 rounded-xl font-bold text-white border border-gray-600 hover:bg-gray-700 transition-all mt-4">Save Client Info</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
