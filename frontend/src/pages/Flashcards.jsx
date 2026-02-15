import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

const Flashcards = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackendDown, setIsBackendDown] = useState(false);

  // Listen for backend recovery to auto-reload flashcards
  useEffect(() => {
    const handleBackendStatus = (event) => {
      const { available } = event.detail;
      if (available && isBackendDown) {
        setIsBackendDown(false);
        fetchFlashcardSets();
      } else if (!available) {
        setIsBackendDown(true);
      }
    };

    window.addEventListener('backend-status-change', handleBackendStatus);
    return () => window.removeEventListener('backend-status-change', handleBackendStatus);
  }, [isBackendDown]);

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      setIsBackendDown(false);
      const { data } = await api.get('/flashcards/sets');
      setFlashcardSets(data);
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      if (error.isBackendDown || error.code === 'BACKEND_UNAVAILABLE') {
        setIsBackendDown(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <Layout>
      <div className="container-primary">
        <div className="section-header mb-8">
          <div>
            <h1 className="section-title">
              🎴 Flashcard Sets
            </h1>
            <p className="section-subtitle">Review and study your flashcards</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p className="text-gray-500 mt-4">Loading flashcard sets...</p>
          </div>
        ) : flashcardSets.length === 0 ? (
          <div className="card empty-state">
            <BookOpen className="empty-state-icon" />
            <h3 className="empty-state-title">No flashcards yet</h3>
            <p className="empty-state-subtitle">Generate flashcards from your documents to get started</p>
            <Link to="/documents" className="btn-primary-lg justify-center mx-auto">
              Go to Documents
            </Link>
          </div>
        ) : (
          <div className="grid-responsive-3">
            {flashcardSets.map((set) => (
              <Link
                key={set.documentId}
                to={`/documents/${set.documentId}`}
                className="card group hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors duration-200">
                    <BookOpen className="w-6 h-6 text-pink-600" />
                  </div>
                  <span className={`badge ${
                    set.progress === 100 ? 'badge-emerald' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {Math.round(set.progress)}%
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 truncate-lines group-hover:text-pink-600 transition-colors duration-200">
                  {set.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 font-medium">{set.count} Cards</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{set.reviewed}/{set.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(set.progress)}`}
                      style={{ width: `${set.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Created {new Date(set.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
