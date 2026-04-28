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

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              SaaS Overview
            </h1>
            <p className="text-gray-400 mt-2">Real-time factory analytics for {user?.full_name}</p>
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold">Logout</button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Workers</h3>
            <p className="text-3xl font-bold">{stats?.workers.total} <span className="text-sm text-green-400">({stats?.workers.active} Active)</span></p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Net Profit</h3>
            <p className="text-3xl font-bold text-green-400">₨ {stats?.profit.net_profit}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Efficiency (Avg Stitches)</h3>
            <p className="text-3xl font-bold text-blue-400">{Math.round(stats?.efficiency)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-400">₨ {stats?.profit.revenue}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Revenue Trend (Last 6 Months)</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Order Status Distribution</h3>
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
