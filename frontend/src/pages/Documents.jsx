import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Trash2,
  Clock,
  Plus,
  BookOpen
} from 'lucide-react';

import Layout from '../components/Layout';
import api from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    file: null
  });
  const [uploadError, setUploadError] = useState('');
  const hasFetched = useRef(false);

  // Listen for backend recovery to auto-reload documents
  useEffect(() => {
    const handleBackendStatus = (event) => {
      const { available } = event.detail;
      if (available && isBackendDown) {
        setIsBackendDown(false);
        setError(null);
        // Auto-reload documents when backend recovers
        fetchDocuments();
      } else if (!available) {
        setIsBackendDown(true);
      }
    };

    window.addEventListener('backend-status-change', handleBackendStatus);
    return () => window.removeEventListener('backend-status-change', handleBackendStatus);
  }, [isBackendDown]);

  useEffect(() => {
    // Prevent double fetch (React StrictMode or re-mount scenarios)
    if (hasFetched.current) return;
    hasFetched.current = true;

    let cancelled = false;

    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsBackendDown(false);
        const { data } = await api.get('/documents');
        if (cancelled) return;
        const docsArray = Array.isArray(data) ? data : (data.documents || []);
        setDocuments(docsArray);
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching documents:', error);
        
        // Check if backend is down (502/proxy error)
        if (error.isBackendDown || error.code === 'BACKEND_UNAVAILABLE') {
          setIsBackendDown(true);
          setError(null); // Don't show generic error, the banner handles it
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load documents';
          setError(errorMessage);
        }
        setDocuments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDocuments();
    return () => { cancelled = true; };
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsBackendDown(false);
      const { data } = await api.get('/documents');
      const docsArray = Array.isArray(data) ? data : (data.documents || []);
      setDocuments(docsArray);
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      if (error.isBackendDown || error.code === 'BACKEND_UNAVAILABLE') {
        setIsBackendDown(true);
        setError(null);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load documents';
        setError(errorMessage);
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({
        ...uploadData,
        file,
        title: uploadData.title || file.name.replace('.pdf', '')
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      setUploadError('Please select a file');
      return;
    }

    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title || uploadData.file.name.replace('.pdf', ''));

    try {
      const response = await api.post('/documents', formData, {
        timeout: 60000, // 60 second timeout for large files
        // Do NOT set Content-Type — the request interceptor in api.js
        // deletes it for FormData so the browser auto-generates the
        // correct multipart boundary string.
      });
      
      console.log('✅ Upload successful:', response.data);
      setShowUpload(false);
      setUploadData({ title: '', file: null });
      setUploadError('');
      
      // Refresh documents list
      await fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      let errorMessage = 'Upload failed. Please try again.';
      const errorDetails = {
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        errorCode: error.code,
        errorMessage: error.message,
        diagnostics: error.diagnostic,
      };
      
      console.error('Upload Error Details:', errorDetails);
      
      // ========== NETWORK ERRORS ==========
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = '⏱️ Request timeout - backend is slow. Check if MongoDB is running.';
        } else if (error.message?.includes('ERR_NETWORK')) {
          errorMessage = '🔴 Network error - cannot reach backend. Ensure backend is running on port 5000.';
        } else if (error.code === 'CONNECTION_REFUSED' || error.networkError) {
          errorMessage = '❌ Cannot connect to backend server. \n\n📋 To fix: \n1. Open terminal in backend folder\n2. Run: npm run dev\n3. Ensure .env has PORT=5000\n4. Retry upload';
        } else {
          errorMessage = `Network error: ${error.message}`;
        }
      }
      // ========== VALIDATION ERRORS ==========
      else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid file or missing title. Please check and try again.';
      }
      // ========== AUTHENTICATION ERRORS ==========
      else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      }
      // ========== FILE SIZE ERRORS ==========
      else if (error.response?.status === 413 || error.message?.includes('413')) {
        errorMessage = '📁 File too large. Maximum size is 10MB. Please use a smaller file.';
      }
      // ========== SERVER ERRORS ==========
      else if (error.response?.status >= 500) {
        errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Backend encountered an error'}`;
      }
      // ========== OTHER HTTP ERRORS ==========
      else if (error.response?.status >= 400) {
        errorMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
      }
      
      console.error('Final error message:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${id}`);
      setError(null);
      await fetchDocuments();
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Failed to delete document:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete document';
      alert(errorMsg);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Layout>
      <div className="container-primary">
        {/* Header */}
        <div className="section-header mb-8 flex flex-col sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h1 className="section-title">
              📚 My Documents
            </h1>
            <p className="section-subtitle">
              Manage and organize your learning materials
            </p>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary-lg justify-center sm:justify-start"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-6 alert alert-error">
            <p className="font-medium">⚠️ {error}</p>
            <button 
              onClick={fetchDocuments}
              className="mt-3 bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="inline-block">
              <div className="spinner"></div>
              <p className="text-gray-500 mt-4">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="card empty-state">
            <FileText className="empty-state-icon" />
            <h3 className="empty-state-title">
              No documents yet
            </h3>
            <p className="empty-state-subtitle">
              Upload your first PDF to get started with AI-powered learning
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary-lg justify-center mx-auto"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <div className="grid-responsive">
            {documents.map((doc) => (
              <div key={doc._id} className="card group hover:shadow-lg">
                <div className="flex justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>

                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/documents/${doc._id}`}>
                  <h3 className="font-semibold mb-2 hover:text-emerald-600 transition-colors duration-200 truncate-lines hover:underline">
                    {doc.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-4 font-medium">
                  {formatFileSize(doc.filesize)}
                </p>

                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  <div className="badge badge-purple">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {doc.flashcardsCount} Cards
                  </div>
                  <div className="badge badge-blue">
                    <FileText className="w-3 h-3 mr-1" />
                    {doc.quizzesCount} Quiz
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-bold mb-6">
                Upload New Document
              </h2>

              <form onSubmit={handleUpload}>
                {uploadError && (
                  <div className="mb-4 p-3 alert alert-error text-sm rounded-lg">
                    {uploadError}
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Document Title</label>
                  <input
                    type="text"
                    placeholder="Enter document title"
                    className="input"
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">PDF File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block">
                      {uploadData.file ? (
                        <>
                          <p className="font-semibold text-emerald-600">✓ {uploadData.file.name}</p>
                          <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="font-medium text-gray-700">Click to upload PDF</p>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpload(false);
                      setUploadError('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default Documents;
