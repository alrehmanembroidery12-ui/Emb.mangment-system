import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center">Loading...</div>;

  const barData = {
    labels: stats?.chartData.map(d => d.month),
    datasets: [
      {
        label: 'Revenue (₨)',
        data: stats?.chartData.map(d => d.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: stats?.orders.map(o => o.status),
    datasets: [
      {
        data: stats?.orders.map(o => o.count),
        backgroundColor: [
          'rgba(234, 179, 8, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)]">
              SaaS Overview
            </h1>
            <p className="text-[var(--text-muted)] mt-2 font-medium">Real-time factory analytics for {user?.full_name}</p>
          </div>
          <button onClick={logout} className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">Logout Account</button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-2">Total Workers</h3>
            <p className="text-4xl font-black tracking-tighter text-[var(--text-main)]">{stats?.workers.total} <span className="text-xs text-green-500 font-bold tracking-normal ml-1">({stats?.workers.active} Active)</span></p>
          </div>
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-2">Net Profit</h3>
            <p className="text-4xl font-black tracking-tighter text-green-500">₨ {stats?.profit.net_profit.toLocaleString()}</p>
          </div>
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-2">Avg Stitches</h3>
            <p className="text-4xl font-black tracking-tighter text-blue-500">{Math.round(stats?.efficiency).toLocaleString()}</p>
          </div>
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-2">Revenue</h3>
            <p className="text-4xl font-black tracking-tighter text-purple-500">₨ {stats?.profit.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-xl font-black mb-8 tracking-tight">Revenue Trend</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow)] card-hover">
            <h3 className="text-xl font-black mb-8 tracking-tight">Orders Distribution</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
