import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Wallet, RefreshCw } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    collectedThisMonth: 0,
    collectedToday: 0
  });

  const [resetting, setResetting] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetRent = async () => {
    if (!window.confirm("Are you sure you want to start a new month? This will set all active students to 'Unpaid'.")) return;
    try {
      setResetting(true);
      const response = await api.post('/students/reset-rent');
      alert(response.data.message);
      await fetchStats();
    } catch (error) {
      console.error("Failed to reset rent", error);
      alert("Failed to reset rent.");
    } finally {
      setResetting(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Unpaid Students', value: stats.unpaidStudents, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Collected This Month', value: `₹${(stats.collectedThisMonth || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Collected Today', value: `₹${(stats.collectedToday || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-primary-500', bg: 'bg-primary-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your PG today.</p>
        </div>
        <button 
          onClick={handleResetRent} 
          disabled={resetting}
          className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto justify-center"
        >
          <RefreshCw size={18} className={resetting ? "animate-spin" : ""} />
          {resetting ? 'Resetting...' : 'Start New Month'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md duration-200">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Additional UI elements can go here, like recent activities or a rent chart */}
    </div>
  );
};

export default Dashboard;
