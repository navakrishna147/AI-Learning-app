import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Sparkles,
  Clock,
  TrendingUp,
  Target,
  Award,
  Activity as ActivityIcon,
  ChevronRight
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    stats: null,
    analytics: null,
    goals: [],
    achievements: null,
    activities: [],
    summary: null
  });
  const [loading, setLoading] = useState(true);
  const [isBackendDown, setIsBackendDown] = useState(false);

  // Listen for backend recovery to auto-reload dashboard
  useEffect(() => {
    const handleBackendStatus = (event) => {
      const { available } = event.detail;
      if (available && isBackendDown) {
        setIsBackendDown(false);
        fetchDashboardData();
      } else if (!available) {
        setIsBackendDown(true);
      }
    };

    window.addEventListener('backend-status-change', handleBackendStatus);
    return () => window.removeEventListener('backend-status-change', handleBackendStatus);
  }, [isBackendDown]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsBackendDown(false);
      const [statsRes, analyticsRes, goalsRes, achievementsRes, activitiesRes, summaryRes] = 
        await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/analytics?days=7'),
          api.get('/dashboard/learning-goals'),
          api.get('/dashboard/achievements'),
          api.get('/dashboard/activities?limit=10'),
          api.get('/dashboard/summary')
        ]);

      setData({
        stats: statsRes.data,
        analytics: analyticsRes.data,
        goals: goalsRes.data,
        achievements: achievementsRes.data,
        activities: activitiesRes.data,
        summary: summaryRes.data
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.isBackendDown || error.code === 'BACKEND_UNAVAILABLE') {
        setIsBackendDown(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh dashboard data every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const stats = data.stats?.overview || {};
  const userStats = data.stats?.userStats || {};
  const goals = data.goals || [];
  const achievements = data.achievements || { achievements: [], unlockedCount: 0 };
  const activities = data.activities || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress, achievements, and learning goals</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 flex gap-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors duration-200 flex gap-2 items-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Documents</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalDocuments || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalDocuments === 1 ? '1 uploaded' : `${stats.totalDocuments} uploaded`}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-pink-50 to-pink-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Flashcards</p>
                    <p className="text-3xl font-bold text-pink-600">{stats.totalFlashcards || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {userStats.totalFlashcardsReviewed || 0} reviewed
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-pink-400 flex-shrink-0" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Quizzes</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completedQuizzes || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.averageQuizScore?.toFixed(1) || 0}% average
                    </p>
                  </div>
                  <Sparkles className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Study Time</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.floor((userStats.totalTimeSpent || 0) / 3600)}h
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {userStats.currentStreak || 0} day streak
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-400 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Achievements */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Recent Achievements
                </h2>
                {achievements.achievements && achievements.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.achievements
                      .filter(a => a.unlocked)
                      .slice(0, 5)
                      .map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{achievement.name}</p>
                            <p className="text-xs text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No achievements yet. Keep learning!</p>
                )}
              </div>

              {/* Streaks & Milestones */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  Your Progress
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Streak</span>
                      <span className="text-lg font-bold text-orange-600">{userStats.currentStreak || 0} 🔥</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((userStats.currentStreak || 0) / 7) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Longest: {userStats.longestStreak || 0} days</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Quiz Score</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {userStats.averageQuizScore?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${userStats.averageQuizScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ActivityIcon className="w-6 h-6 text-blue-500" />
                Recent Activities
              </h2>
              {activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.slice(0, 8).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activities yet</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Usage */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Usage</h2>
                <div className="space-y-4">
                  {data.analytics?.featureUsage ? (
                    Object.entries(data.analytics.featureUsage).map(([feature, count]) => (
                      <div key={feature}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="capitalize font-medium text-gray-700">{feature}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${
                                ((count) /
                                  Math.max(
                                    ...Object.values(data.analytics?.featureUsage || {})
                                  )) *
                                100
                              }%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No analytics data available</p>
                  )}
                </div>
              </div>

              {/* Quiz Performance */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Performance</h2>
                {data.analytics?.quizPerformance && data.analytics.quizPerformance.length > 0 ? (
                  <div className="space-y-2">
                    {data.analytics.quizPerformance.slice(-5).map((quiz, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{quiz.date}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                quiz.score >= 80
                                  ? 'bg-emerald-500'
                                  : quiz.score >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${quiz.score}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-sm text-gray-900 w-10">{quiz.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No quiz records yet</p>
                )}
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Activity</h2>
              {data.analytics?.activityByDay ? (
                <div className="space-y-3">
                  {Object.entries(data.analytics.activityByDay).map(([day, dayData]) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 w-24">{day}</span>
                      <div className="flex-1 flex gap-2">
                        {dayData.document > 0 && (
                          <div className="flex items-center gap-1" title={`${dayData.document} documents`}>
                            <div className="h-6 bg-blue-500 rounded" style={{ width: `${dayData.document * 10}px` }}></div>
                            <span className="text-xs">{dayData.document}</span>
                          </div>
                        )}
                        {dayData.quiz > 0 && (
                          <div className="flex items-center gap-1" title={`${dayData.quiz} quizzes`}>
                            <div className="h-6 bg-emerald-500 rounded" style={{ width: `${dayData.quiz * 10}px` }}></div>
                            <span className="text-xs">{dayData.quiz}</span>
                          </div>
                        )}
                        {dayData.flashcard > 0 && (
                          <div className="flex items-center gap-1" title={`${dayData.flashcard} flashcards`}>
                            <div className="h-6 bg-pink-500 rounded" style={{ width: `${dayData.flashcard * 10}px` }}></div>
                            <span className="text-xs">{dayData.flashcard}</span>
                          </div>
                        )}
                        {dayData.chat > 0 && (
                          <div className="flex items-center gap-1" title={`${dayData.chat} chats`}>
                            <div className="h-6 bg-purple-500 rounded" style={{ width: `${dayData.chat * 10}px` }}></div>
                            <span className="text-xs">{dayData.chat}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No activity data available</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: GOALS */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal, idx) => (
                <div key={idx} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{
                        goal.category === 'quizzes' ? '🎯' :
                        goal.category === 'flashcards' ? '📚' :
                        goal.category === 'streak' ? '🔥' :
                        goal.category === 'score' ? '⭐' :
                        '⏰'
                      }</span>
                      <div>
                        <p className="font-bold text-gray-900">{goal.title}</p>
                        <p className="text-sm text-gray-600">
                          {goal.current} / {goal.target} {goal.unit || ''}
                        </p>
                      </div>
                    </div>
                    {goal.completed && <span className="text-2xl">✅</span>}
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.completed
                          ? 'bg-emerald-500'
                          : goal.progress >= 75
                          ? 'bg-blue-500'
                          : goal.progress >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Loading goals...</p>
            )}
          </div>
        )}

        {/* TAB: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>{achievements.unlockedCount || 0}</strong> of{' '}
                <strong>{achievements.totalCount || 0}</strong> achievements unlocked
              </p>
              <div className="mt-3 w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${achievements.progress || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.achievements && achievements.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`card transition-all duration-200 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                      : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-bold text-gray-900 mb-1">{achievement.name}</p>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {achievement.unlocked && (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedDashboard;
