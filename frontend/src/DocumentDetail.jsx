import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Sparkles,
  FileText,
  BookOpen,
  Trophy,
  ExternalLink,
} from "lucide-react";

import Layout from "./components/Layout";
import api from "./services/api";

const DocumentDetail = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState("");

  const messagesEndRef = useRef(null);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchDocument();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    if (activeTab === "flashcards") fetchFlashcards();
    if (activeTab === "quizzes") fetchQuizzes();
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDocument = async () => {
    try {
      const { data } = await api.get(`/documents/${id}`);
      setDocument(data);
    } catch (err) {
      console.error("Failed to fetch document", err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch chat", err);
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

  /* ---------------- CHAT ---------------- */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setSending(true);

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const { data } = await api.post(`/chat/${id}`, {
        message: userMsg,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  /* ---------------- AI ACTIONS ---------------- */

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await api.post(`/flashcards/generate/${id}`, { count: 10 });
      showNotification("Flashcards generated!");
      fetchFlashcards();
    } catch {
      alert("Flashcard generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      await api.post(`/quizzes/generate/${id}`, { questionCount: 5 });
      showNotification("Quiz generated!");
      fetchQuizzes();
    } catch {
      alert("Quiz generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  /* ---------------- UI ---------------- */

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {notification && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <Link
          to="/documents"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Documents
        </Link>

        <h1 className="text-3xl font-bold mb-8">{document.title}</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6">
          {["content", "chat", "ai", "flashcards", "quizzes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-emerald-500 text-emerald-600"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === "content" && (
          <div className="card">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Document Content</h2>
              <a
                href={`/api/documents/${id}/view`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-600"
              >
                <ExternalLink size={16} />
                Open PDF
              </a>
            </div>

            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg max-h-[600px] overflow-auto">
              {document.content}
            </pre>
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="card h-[600px] flex flex-col">
            <div className="flex-1 overflow-auto space-y-4 mb-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-lg max-w-[70%] ${
                      m.role === "user"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="input flex-1"
                placeholder="Ask something..."
              />
              <button className="btn-primary">
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* AI */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-bold mb-2">Generate Flashcards</h2>
              <button
                onClick={handleGenerateFlashcards}
                className="btn-primary"
                disabled={generating}
              >
                Generate
              </button>
            </div>

            <div className="card">
              <h2 className="font-bold mb-2">Generate Quiz</h2>
              <button
                onClick={handleGenerateQuiz}
                className="btn-primary"
                disabled={generating}
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {/* FLASHCARDS */}
        {activeTab === "flashcards" && (
          <div className="grid md:grid-cols-2 gap-4">
            {flashcards.map((c) => (
              <div key={c._id} className="card">
                <p className="font-semibold">{c.question}</p>
                <p className="text-gray-700 mt-2">{c.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="space-y-4">
            {quizzes.map((q) => (
              <div key={q._id} className="card">
                <h3 className="font-semibold">{q.title}</h3>
                <p className="text-sm text-gray-600">
                  {q.questions.length} questions
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentDetail;
