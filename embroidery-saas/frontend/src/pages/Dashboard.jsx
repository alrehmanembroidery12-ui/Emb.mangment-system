import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
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

  if (loading) return <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center font-bold">Loading...</div>;

  // Sophisticated Mock Data logic to match 'scr7' wavy aesthetic
  let chartLabels = stats?.chartData.map(d => d.month) || [];
  let chartValues = stats?.chartData.map(d => d.amount) || [];

  if (chartValues.length === 1) {
    const val = chartValues[0];
    chartLabels = ['Start', 'Phase 1', 'Phase 2', 'Current'];
    chartValues = [val * 0.4, val * 0.8, val * 0.6, val];
  }

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Profit',
        data: chartValues,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height || 400);
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)'); // Pink
          gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)'); // Indigo
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return gradient;
        },
        borderColor: (context) => {
          const ctx = context.chart.ctx;
          const chartWidth = context.chart.width || 800;
          const gradient = ctx.createLinearGradient(0, 0, chartWidth, 0);
          gradient.addColorStop(0, '#6366f1'); // Blue
          gradient.addColorStop(0.4, '#a855f7'); // Purple
          gradient.addColorStop(0.7, '#ec4899'); // Pink
          gradient.addColorStop(1, '#f59e0b'); // Yellow/Orange
          return gradient;
        },
        borderWidth: 4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ec4899',
        pointHoverBorderWidth: 3,
        tension: 0.5, // High tension for wavy look
        spanGaps: true
      },
    ],
  };

  const barData = {
    labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Production',
        data: [45000, 68000, 55000, 38000, 62000, 48000, 48000],
        backgroundColor: '#facc15', // Yellow
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      },
      {
        label: 'Target',
        data: [28000, 38000, 28000, 18000, 42000, 28000, 28000],
        backgroundColor: '#8b5cf6', // Purple
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 12,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(19, 17, 28, 0.9)',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: { 
        grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', drawBorder: false }, 
        ticks: { 
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', 
          font: { size: 10 },
          callback: function(value) { return value >= 1000 ? (value/1000) + 'K' : value; }
        } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', font: { size: 10 } } 
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        stacked: true,
      },
      x: {
        ...chartOptions.scales.x,
        stacked: true,
      }
    }
  };

  return (
    <div className="flex-1 min-h-full overflow-y-auto bg-[var(--bg-main)] text-[var(--text-main)] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Analytics <span className="text-purple-500">Dashboard</span>
            </h1>
            <p className="text-[var(--text-muted)] text-xs mt-1 opacity-70">Welcome back, {user?.full_name}.</p>
          </div>
          <div className="flex items-center space-x-6">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-500">System Status</span>
                <span className="text-[10px] font-bold text-green-500 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span> Online
                </span>
             </div>
             <button onClick={logout} className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Logout</button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-grad-1 p-6 rounded-[24px] shadow-lg shadow-indigo-600/10 relative overflow-hidden group">
            <h3 className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-2">Total Workers</h3>
            <p className="text-3xl font-bold tracking-tight text-white">{stats?.workers.total}</p>
            <div className="mt-3 text-[9px] font-bold text-white/70 bg-white/10 w-fit px-2 py-0.5 rounded-full">
               {stats?.workers.active} Active
            </div>
          </div>
          
          <div className="bg-grad-2 p-6 rounded-[24px] shadow-lg shadow-cyan-600/10 relative overflow-hidden group">
            <h3 className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-2">Net Profit</h3>
            <p className="text-3xl font-bold tracking-tight text-white">₨{stats?.profit.net_profit.toLocaleString()}</p>
            <div className="mt-3 text-[9px] font-bold text-white/70 bg-white/10 w-fit px-2 py-0.5 rounded-full">
               Monthly Growth
            </div>
          </div>

          <div className="bg-grad-3 p-6 rounded-[24px] shadow-lg shadow-orange-600/10 relative overflow-hidden group">
            <h3 className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-2">Avg Stitches</h3>
            <p className="text-3xl font-bold tracking-tight text-white">{Math.round(stats?.efficiency).toLocaleString()}</p>
            <div className="mt-3 text-[9px] font-bold text-white/70 bg-white/10 w-fit px-2 py-0.5 rounded-full">
               Performance
            </div>
          </div>

          <div className="glass-card p-6 rounded-[24px] relative overflow-hidden">
            <h3 className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest mb-2">Revenue</h3>
            <p className="text-3xl font-bold tracking-tight text-purple-500">₨{stats?.profit.revenue.toLocaleString()}</p>
            <div className="mt-3 text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-input)] w-fit px-2 py-0.5 rounded-full">
               Total Earnings
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-8 rounded-[32px]">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold tracking-tight">Profit <span className="text-pink-500">Statistics</span></h3>
               <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Yearly Analysis</span>
            </div>
            <div className="h-64">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
          <div className="glass-card p-8 rounded-[32px]">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold tracking-tight">Production / <span className="text-yellow-500">Week</span></h3>
               <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Shift Performance</span>
            </div>
            <div className="h-64">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
