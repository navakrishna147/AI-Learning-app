import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Sparkles, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalFlashcards: 0,
    totalQuizzes: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities')
      ]);

      setStats(statsRes.data || {
        totalDocuments: 0,
        totalFlashcards: 0,
        totalQuizzes: 0
      });
      setActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: 'TOTAL DOCUMENTS',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/documents'
    },
    {
      title: 'TOTAL FLASHCARDS',
      value: stats.totalFlashcards,
      icon: BookOpen,
      color: 'bg-pink-500',
      link: '/flashcards'
    },
    {
      title: 'TOTAL QUIZZES',
      value: stats.totalQuizzes,
      icon: Sparkles,
      color: 'bg-emerald-500',
      link: '/documents'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your learning progress and activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link
                key={`stat-${i}`}
                to={stat.link}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Activity */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-gray-700 flex-shrink-0" />
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No activity yet</p>
              <Link to="/documents" className="btn-primary">
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((a) => (
                <div key={a._id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{a.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
