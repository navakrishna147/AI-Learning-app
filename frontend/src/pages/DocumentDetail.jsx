import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Sparkles,
  FileText,
  BookOpen,
  Trophy,
  ExternalLink,
  X,
  MessageCircle,
} from "lucide-react";

import Layout from "../components/Layout";
import Chat from "../components/Chat";
import api from "../services/api";

const DocumentDetail = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // ── Independent loading states per feature ──
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // ── Concepts + Discussion state ──
  const [concepts, setConcepts] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [discussionContent, setDiscussionContent] = useState("");
  const [discussionLoading, setDiscussionLoading] = useState(false);

  const [notification, setNotification] = useState("");
  const [documentStats, setDocumentStats] = useState(null);
  const [error, setError] = useState(null);

  // ── Abort-controller refs to prevent overlapping calls ──
  const summaryAbort = useRef(null);
  const conceptsAbort = useRef(null);
  const flashcardsAbort = useRef(null);
  const quizAbort = useRef(null);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDocument(),
          fetchDocumentStats(),
        ]);
      } catch (err) {
        console.error("Failed to load document", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeTab === "flashcards") fetchFlashcards();
    if (activeTab === "quizzes") fetchQuizzes();
  }, [activeTab]);

  const fetchDocument = async () => {
    try {
      const { data } = await api.get(`/documents/${id}`);
      if (data && data._id) {
        setDocument(data);
      } else if (data && data.document) {
        setDocument(data.document);
      } else {
        console.error("Unexpected document response:", data);
        setError("Failed to load document");
      }
    } catch (err) {
      console.error("Failed to fetch document", err);
      setError("Failed to load document");
    }
  };

  const fetchDocumentStats = async () => {
    try {
      const { data } = await api.get(`/documents/${id}/stats`);
      if (data && data.success !== false && data.stats) {
        setDocumentStats(data.stats);
      } else {
        console.warn("Stats not available for this document");
        setDocumentStats(null);
      }
    } catch (err) {
      console.error("Failed to fetch document stats", err);
      setDocumentStats(null);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const { data } = await api.get(`/flashcards/${id}`);
      setFlashcards(data || []);
    } catch (err) {
      console.error("Failed to fetch flashcards", err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      setQuizzes(data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    }
  };

  /* ---------------- AI ACTIONS (isolated) ---------------- */

  const handleGenerateSummary = useCallback(async () => {
    if (summaryLoading) return;              // prevent double-click
    summaryAbort.current?.abort();            // cancel any in-flight call
    const controller = new AbortController();
    summaryAbort.current = controller;

    setSummaryLoading(true);
    try {
      const { data } = await api.post(`/documents/${id}/summary`, {}, { signal: controller.signal });
      showNotification("✨ Summary generated!");
      await fetchDocument();
    } catch (err) {
      if (err.name !== "CanceledError") {
        const msg = err.response?.data?.message || "Summary generation failed";
        showNotification(`❌ ${msg}`, true);
      }
    } finally {
      setSummaryLoading(false);
    }
  }, [id, summaryLoading]);

  const handleGetKeyConcepts = useCallback(async () => {
    if (conceptsLoading) return;
    conceptsAbort.current?.abort();
    const controller = new AbortController();
    conceptsAbort.current = controller;

    setConceptsLoading(true);
    try {
      const { data } = await api.post(`/documents/${id}/concepts`, {}, { signal: controller.signal });
      const extracted = data.concepts || [];
      setConcepts(extracted);
      showNotification(`📚 Found ${extracted.length} key concepts!`);
    } catch (err) {
      if (err.name !== "CanceledError") {
        const msg = err.response?.data?.message || "Failed to extract concepts";
        showNotification(`❌ ${msg}`, true);
      }
    } finally {
      setConceptsLoading(false);
    }
  }, [id, conceptsLoading]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (flashcardsLoading) return;
    flashcardsAbort.current?.abort();
    const controller = new AbortController();
    flashcardsAbort.current = controller;

    setFlashcardsLoading(true);
    try {
      await api.post(`/flashcards/generate/${id}`, { count: 10 }, { signal: controller.signal });
      showNotification("✨ Flashcards generated!");
      await fetchFlashcards();
    } catch (err) {
      if (err.name !== "CanceledError") {
        const msg = err.response?.data?.message || "Flashcard generation failed";
        showNotification(`❌ ${msg}`, true);
      }
    } finally {
      setFlashcardsLoading(false);
    }
  }, [id, flashcardsLoading]);

  const handleGenerateQuiz = useCallback(async () => {
    if (quizLoading) return;
    quizAbort.current?.abort();
    const controller = new AbortController();
    quizAbort.current = controller;

    setQuizLoading(true);
    try {
      await api.post(`/quizzes/generate/${id}`, { questionCount: 10 }, { signal: controller.signal });
      showNotification("✨ Quiz generated!");
      await fetchQuizzes();
    } catch (err) {
      if (err.name !== "CanceledError") {
        const msg = err.response?.data?.message || "Quiz generation failed";
        showNotification(`❌ ${msg}`, true);
      }
    } finally {
      setQuizLoading(false);
    }
  }, [id, quizLoading]);

  /* ------------ Topic Discussion ------------ */

  const handleTopicClick = useCallback(async (topic) => {
    setSelectedTopic(topic);
    setDiscussionContent("");
    setDiscussionLoading(true);
    try {
      const { data } = await api.post(`/chat/${id}`, {
        message: `Explain the concept "${topic}" from this document in simple terms. Give a brief explanation (3-5 sentences) and one real-world example.`,
      });
      setDiscussionContent(
        data.response || data.message || data.answer || "No explanation available."
      );
    } catch (err) {
      setDiscussionContent("Failed to load explanation. Please try again.");
    } finally {
      setDiscussionLoading(false);
    }
  }, [id]);

  const closeDiscussion = () => {
    setSelectedTopic(null);
    setDiscussionContent("");
  };

  /* ------------ Helpers ------------ */

  const showNotification = (msg, _isError = false) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleOpenPDF = async () => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Failed to open PDF:", error);
      showNotification("❌ Failed to open PDF", true);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg font-semibold">{error || 'Document not found'}</p>
          <Link to="/documents" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Documents
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {notification && (
        <div className="fixed top-20 right-6 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col h-full">
        <Link
          to="/documents"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Documents
        </Link>

        {/* Header with Stats */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
          <p className="text-gray-600 mb-4">{document.description}</p>
          
          {documentStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">📄 Pages</p>
                <p className="text-2xl font-bold text-blue-600">{documentStats.metadata?.pages || '-'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">📝 Words</p>
                <p className="text-2xl font-bold text-green-600">{documentStats.stats?.words || '-'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">👁️ Size</p>
                <p className="text-2xl font-bold text-purple-600">{documentStats.filesize || '-'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">📅 Created</p>
                <p className="text-2xl font-bold text-orange-600">{documentStats.createdAt ? new Date(documentStats.createdAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {["content", "chat", "ai", "flashcards", "quizzes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-3 capitalize whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "content" && "📋 " + tab}
              {tab === "chat" && "💬 " + tab}
              {tab === "ai" && "✨ " + tab}
              {tab === "flashcards" && "🎴 " + tab}
              {tab === "quizzes" && "📝 " + tab}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0">
        {/* CONTENT */}
        {activeTab === "content" && (
          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Document Content</h2>
              <a
                onClick={handleOpenPDF}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                <ExternalLink size={16} />
                Open PDF
              </a>
            </div>

            <pre className="bg-gray-900 text-gray-100 p-6 max-h-[calc(100vh-350px)] overflow-auto font-mono text-sm">
              {document.content}
            </pre>
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="h-[700px]">
            <Chat documentId={id} documentTitle={document.title} documentContent={document.content} />
          </div>
        )}

        {/* AI */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ── Generate Summary ── */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold">Generate Summary</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Let AI create a concise summary of this document.
                </p>
                {document.summary && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700">{document.summary}</p>
                  </div>
                )}
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition"
                >
                  {summaryLoading ? "⏳ Generating..." : "Generate Summary"}
                </button>
              </div>

              {/* ── Key Concepts ── */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">Key Concepts</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Extract important concepts and topics from the document.
                </p>

                {/* Show extracted concepts as clickable chips */}
                {concepts.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {concepts.map((concept, idx) => {
                      const label = concept.includes(":")
                        ? concept.split(":")[0].trim()
                        : concept;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleTopicClick(label)}
                          className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${
                            selectedTopic === label
                              ? "bg-blue-600 text-white shadow"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fallback: show document.keywords if no extracted concepts yet */}
                {concepts.length === 0 &&
                  document.keywords &&
                  document.keywords.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {document.keywords.slice(0, 8).map((keyword, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTopicClick(keyword)}
                          className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${
                            selectedTopic === keyword
                              ? "bg-blue-600 text-white shadow"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  )}

                <button
                  onClick={handleGetKeyConcepts}
                  disabled={conceptsLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {conceptsLoading ? "⏳ Extracting..." : "Extract Concepts"}
                </button>
              </div>

              {/* ── Generate Flashcards ── */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold">Generate Flashcards</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Create study flashcards from this document.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {flashcards.length} flashcards created
                </p>
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={flashcardsLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  {flashcardsLoading ? "⏳ Generating..." : "Generate Flashcards"}
                </button>
              </div>

              {/* ── Generate Quiz ── */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold">Generate Quiz</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Test your knowledge with an AI-generated quiz.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {quizzes.length} quizzes created
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={quizLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
                >
                  {quizLoading ? "⏳ Generating..." : "Generate Quiz"}
                </button>
              </div>
            </div>

            {/* ── Topic Discussion Panel ── */}
            {selectedTopic && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-blue-200">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Topic: <span className="text-blue-600">{selectedTopic}</span>
                    </h3>
                  </div>
                  <button
                    onClick={closeDiscussion}
                    className="p-1 hover:bg-blue-100 rounded-full transition"
                    aria-label="Close discussion"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  {discussionLoading ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span>Loading explanation...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {discussionContent}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FLASHCARDS */}
        {activeTab === "flashcards" && (
          <div>
            {flashcards.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No flashcards yet. Generate from the AI tab!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcards.map((card) => (
                  <div
                    key={card._id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer group"
                  >
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 group-hover:bg-blue-100 transition">
                      <p className="font-semibold text-gray-900">{card.question}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 text-sm">{card.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUIZZES */}
        {activeTab === "quizzes" && (
          <div>
            {quizzes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No quizzes yet. Generate from the AI tab!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz._id}
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setShowQuizModal(true);
                    }}
                    className="w-full text-left block bg-white rounded-lg shadow p-6 hover:shadow-lg hover:bg-blue-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {quiz.questions?.length || 0} questions
                        </p>
                      </div>
                      <span className="text-3xl">📝</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        </div>

        {/* Quiz Modal */}
        {showQuizModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {selectedQuiz.questions && selectedQuiz.questions.map((question, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded mr-3">{idx + 1}</span>
                      {question.question}
                    </h3>
                    <div className="space-y-2 ml-12">
                      {question.options?.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className="p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-gray-700">
                        Correct Answer: <span className="text-green-700">{question.correctAnswer}</span>
                      </p>
                      {question.explanation && (
                        <p className="text-sm text-gray-600 mt-2">{question.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentDetail;
