import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CreditCard, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Clock, Search, Filter, Calendar, Printer, Download, FileText, User, Building } from 'lucide-react';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState({ total_receivable: 0, total_payable: 0, monthly_income: 0, monthly_expense: 0 });
  const [clients, setClients] = useState([]);
  
  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('all');
  const [machines, setMachines] = useState([]);
  
  // Report Data
  const [reportData, setReportData] = useState([]);
  const [factoryReport, setFactoryReport] = useState({ income: [], expense: [] });

  useEffect(() => {
    fetchOverview();
    fetchClients();
    fetchMachines();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      if (res.data.finances) {
        setSummary({
          total_receivable: res.data.finances.receivable,
          total_payable: res.data.finances.payable,
          monthly_income: res.data.profit.revenue,
          monthly_expense: res.data.profit.cost
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await api.get('/api/machines');
      setMachines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateClientReport = async () => {
    if (!selectedClientId) return alert('Pehlay client select karain!');
    try {
      const res = await api.get(`/api/reports/client?client_id=${selectedClientId}&start_date=${startDate}&end_date=${endDate}`);
      setReportData(res.data);
    } catch (err) {
      alert('Report generate kernay main masla hua');
    }
  };

  const generateFactoryReport = async () => {
    try {
      const res = await api.get(`/api/reports/factory?start_date=${startDate}&end_date=${endDate}`);
      setFactoryReport(res.data);
    } catch (err) {
      alert('Report generate kernay main masla hua');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Sidebar / Tabs */}
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Financial Reports</h1>
          <p className="text-[var(--text-muted)] text-xs mt-1 opacity-70">Track your factory's revenue, expenses, and machine efficiency</p>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>Overview</button>
            <button onClick={() => setActiveTab('client')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'client' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>Ledger</button>
            <button onClick={() => setActiveTab('factory')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'factory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>Factory</button>
            <button onClick={() => setActiveTab('machine')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'machine' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>Machine</button>
          </div>
          <button onClick={handlePrint} className="bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-main)] px-5 py-2.5 rounded-xl font-bold transition-all border border-[var(--border-color)] flex items-center space-x-2 shadow-sm text-[10px] uppercase tracking-widest">
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 no-print">
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group shadow-[var(--shadow)] card-hover">
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><Wallet size={120} /></div>
              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Total Receivables</p>
              <p className="text-2xl font-bold text-green-500 tracking-tight">₨ {parseFloat(summary.total_receivable).toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group shadow-[var(--shadow)] card-hover">
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><ArrowDownRight size={120} /></div>
              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Total Payables</p>
              <p className="text-2xl font-bold text-red-500 tracking-tight">₨ {parseFloat(summary.total_payable).toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group shadow-[var(--shadow)] card-hover">
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><TrendingUp size={120} /></div>
              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-2xl font-bold text-blue-500 tracking-tight">₨ {parseFloat(summary.monthly_income).toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group shadow-[var(--shadow)] card-hover">
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><TrendingDown size={120} /></div>
              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-purple-500 tracking-tight">₨ {parseFloat(summary.monthly_expense).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-16 text-center space-y-6 shadow-[var(--shadow)]">
            <div className="w-24 h-24 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center mx-auto text-[var(--text-muted)] rotate-3"><FileText size={48} /></div>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Select a Report Category</h3>
              <p className="text-[var(--text-muted)] text-xs mt-3 font-medium leading-relaxed opacity-70">Detailed ledger reports aur financial statements hasil kernay k liye oper diye gaye tabs ka istemal karain. Aap client-wise ya machine-wise performance reports bhi generate kar saktay hain.</p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'machine' && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-wrap gap-4 items-end no-print">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Machine</label>
              <select 
                value={selectedMachineId} 
                onChange={(e) => setSelectedMachineId(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Machines</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button 
              onClick={async () => {
                try {
                  const res = await api.get(`/api/reports/machine?machine_id=${selectedMachineId}&start_date=${startDate}&end_date=${endDate}`);
                  setReportData(res.data);
                } catch (err) {
                  alert('Machine report generate kernay main masla hua');
                }
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Generate Machine Report
            </button>
          </div>

          <div className="bg-white text-black p-4 md:p-10 rounded-2xl shadow-2xl print:m-0 print:shadow-none min-h-[800px] overflow-hidden">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Machine Performance Report</h2>
                <p className="text-gray-500 mt-1 font-bold">Production & Efficiency Analysis</p>
                <p className="text-gray-400 text-xs mt-1 italic">Date Range: {startDate} to {endDate}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg">Embroidery Factory Pro</h3>
                <p className="text-gray-400 text-xs">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-900 text-xs font-black uppercase">
                    <th className="py-4 px-2">Machine Name</th>
                    <th className="py-4 px-2">Shift</th>
                    <th className="py-4 px-2 text-right">Total Stitches</th>
                    <th className="py-4 px-2 text-right">Downtime (Min)</th>
                    <th className="py-4 px-2 text-right">Logs</th>
                    <th className="py-4 px-2 text-right">Avg Stitches/Log</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {reportData.length > 0 ? (
                    reportData.map((m, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 px-2 font-bold">{m.machine_name}</td>
                        <td className="py-4 px-2">{m.shift || 'N/A'}</td>
                        <td className="py-4 px-2 text-right font-bold text-blue-600">{parseInt(m.total_stitches || 0).toLocaleString()}</td>
                        <td className="py-4 px-2 text-right text-red-500">{m.total_downtime || 0} min</td>
                        <td className="py-4 px-2 text-right">{m.log_entries}</td>
                        <td className="py-4 px-2 text-right font-black">
                          {m.log_entries > 0 ? Math.round(m.total_stitches / m.log_entries).toLocaleString() : 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="py-20 text-center text-gray-400 italic">No machine records found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-800 font-bold uppercase mb-2">Efficiency Insight</p>
              <p className="text-sm text-blue-900 leading-relaxed">Zyada downtime wali machines ki maintenance check karain aur jin machines ka stitch count zyada hai unka usage balance karain.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'client' && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-wrap gap-4 items-end no-print">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Client</label>
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose Client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.shop_name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateClientReport} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">Generate Report</button>
          </div>

          <div className="bg-white text-black p-4 md:p-10 rounded-2xl shadow-2xl print:m-0 print:shadow-none min-h-[800px] overflow-hidden">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Client Ledger Report</h2>
                <p className="text-gray-500 mt-1 font-bold">{clients.find(c => c.id == selectedClientId)?.name} - {clients.find(c => c.id == selectedClientId)?.shop_name}</p>
                <p className="text-gray-400 text-xs mt-1 italic">Date Range: {startDate} to {endDate}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg">Embroidery Factory Pro</h3>
                <p className="text-gray-500 text-sm">Industrial Accounts Section</p>
                <p className="text-gray-400 text-xs">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-900 text-xs font-black uppercase">
                    <th className="py-4 px-2">Date</th>
                    <th className="py-4 px-2">Description</th>
                    <th className="py-4 px-2 text-right">Debit (+)</th>
                    <th className="py-4 px-2 text-right">Credit (-)</th>
                    <th className="py-4 px-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {reportData.length > 0 ? (
                    reportData.reduce((acc, t, idx) => {
                      const prevBalance = idx === 0 ? 0 : acc[idx-1].runningBalance;
                      const credit = parseFloat(t.credit || 0);
                      const debit = parseFloat(t.debit || 0);
                      // Balance = Bills (Debit) - Payments (Credit)
                      const currentBalance = prevBalance + (debit - credit);
                      acc.push({ ...t, runningBalance: currentBalance });
                      return acc;
                    }, []).map((t) => (
                      <tr key={t.id} className="border-b border-gray-100">
                        <td className="py-4 px-2">{new Date(t.transaction_date).toLocaleDateString()}</td>
                        <td className="py-4 px-2 font-medium">{t.description || 'Transaction'}</td>
                        <td className="py-4 px-2 text-right text-red-600 font-bold">{parseFloat(t.debit || 0) > 0 ? `₨ ${parseFloat(t.debit).toLocaleString()}` : '-'}</td>
                        <td className="py-4 px-2 text-right text-green-600 font-bold">{parseFloat(t.credit || 0) > 0 ? `₨ ${parseFloat(t.credit).toLocaleString()}` : '-'}</td>
                        <td className="py-4 px-2 text-right font-black text-blue-600">₨ {t.runningBalance.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-20 text-center text-gray-400 italic">No transactions found for this period. Pehlay client select karain aur "Generate Report" click karain.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {reportData.length > 0 && (
              <div className="mt-8 flex justify-end">
                <div className="bg-gray-50 p-6 rounded-2xl w-64 space-y-2 border border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 font-bold uppercase"><span>Total Bill:</span> <span className="text-black font-bold">₨ {reportData.reduce((acc, t) => acc + parseFloat(t.debit || 0), 0).toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs text-gray-500 font-bold uppercase"><span>Total Paid:</span> <span className="text-black font-bold">₨ {reportData.reduce((acc, t) => acc + parseFloat(t.credit || 0), 0).toLocaleString()}</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-lg"><span>Net Balance:</span> <span className="text-blue-600">₨ {(reportData.reduce((acc, t) => acc + parseFloat(t.debit || 0), 0) - reportData.reduce((acc, t) => acc + parseFloat(t.credit || 0), 0)).toLocaleString()}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'factory' && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-wrap gap-4 items-end no-print">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateFactoryReport} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20">Generate Factory Report</button>
          </div>

          <div className="bg-white text-black p-4 md:p-10 rounded-2xl shadow-2xl print:m-0 print:shadow-none min-h-[800px] overflow-hidden">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-purple-600">Factory Financial Statement</h2>
                <p className="text-gray-500 mt-1 font-bold">Overall Factory Accounts</p>
                <p className="text-gray-400 text-xs mt-1 italic">Date Range: {startDate} to {endDate}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg">Embroidery Factory Pro</h3>
                <p className="text-gray-400 text-xs">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="overflow-x-auto">
                <h3 className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-black uppercase text-xs mb-4">Incomes (Client Payments)</h3>
                <table className="w-full text-xs min-w-[300px]">
                   <thead className="border-b border-gray-900 font-bold">
                     <tr><th className="py-2 text-left">Date</th><th className="text-left">Ref</th><th className="text-right">Amount</th></tr>
                   </thead>
                   <tbody>
                     {factoryReport.income.map(t => (
                       <tr key={t.id} className="border-b border-gray-50">
                         <td className="py-3">{new Date(t.transaction_date).toLocaleDateString()}</td>
                         <td>{t.description || 'Payment'}</td>
                         <td className="text-right font-bold text-green-600">₨ {parseFloat(t.credit || 0).toLocaleString()}</td>
                       </tr>
                     ))}
                     {factoryReport.income.length === 0 && <tr><td colSpan="3" className="py-10 text-center text-gray-400">No income records</td></tr>}
                   </tbody>
                </table>
              </div>
              <div className="overflow-x-auto">
                <h3 className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-black uppercase text-xs mb-4">Expenses (Worker Payments)</h3>
                <table className="w-full text-xs min-w-[300px]">
                   <thead className="border-b border-gray-900 font-bold">
                     <tr><th className="py-2 text-left">Date</th><th className="text-left">Ref</th><th className="text-right">Amount</th></tr>
                   </thead>
                   <tbody>
                     {factoryReport.expense.map(t => (
                       <tr key={t.id} className="border-b border-gray-50">
                         <td className="py-3">{new Date(t.transaction_date).toLocaleDateString()}</td>
                         <td>{t.description || 'Advance/Salary'}</td>
                         <td className="text-right font-bold text-red-600">₨ {parseFloat(t.amount || t.debit || 0).toLocaleString()}</td>
                       </tr>
                     ))}
                     {factoryReport.expense.length === 0 && <tr><td colSpan="3" className="py-10 text-center text-gray-400">No expense records</td></tr>}
                   </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 border-t-2 border-gray-900 pt-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gray-50 p-6 rounded-2xl text-center">
                   <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Cash In</p>
                   <p className="text-2xl font-black text-green-600">₨ {factoryReport.income.reduce((acc, t) => acc + parseFloat(t.credit || 0), 0).toLocaleString()}</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-2xl text-center">
                   <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Cash Out</p>
                   <p className="text-2xl font-black text-red-600">₨ {factoryReport.expense.reduce((acc, t) => acc + parseFloat(t.amount || t.debit || 0), 0).toLocaleString()}</p>
                 </div>
                 <div className="bg-blue-600 p-6 rounded-2xl text-center text-white shadow-xl shadow-blue-600/20">
                   <p className="text-xs font-bold uppercase mb-1 opacity-80">Net Cash Flow</p>
                   <p className="text-2xl font-black">₨ {(factoryReport.income.reduce((acc, t) => acc + parseFloat(t.credit || 0), 0) - factoryReport.expense.reduce((acc, t) => acc + parseFloat(t.amount || t.debit || 0), 0)).toLocaleString()}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print, .print * { visibility: visible; }
          .no-print { display: none !important; }
          .print { position: absolute; left: 0; top: 0; width: 100%; }
          .bg-white { color: black !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .ml-64 { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Billing;
