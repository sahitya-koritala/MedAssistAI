import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Bot, User, Send, Loader2, Sparkles, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../../services/api";

export default function AIConsultant() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      content: "welcome", // Special flag
      isWelcome: true
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to UI
    const newUserMsg = { id: Date.now(), role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Create a localized prompt context based on current language dynamically using Intl.DisplayNames
      const currentLangCode = i18n?.language || 'en';
      const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(currentLangCode) || 'English';
      const languageContext = `Please respond entirely in ${languageName}. `;

      const response = await apiRequest("/gemini/chat", {
        method: "POST",
        body: JSON.stringify({
          prompt: languageContext + userMessage,
        })
      });

      if (response.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "bot",
          content: response.response
        }]);
      } else {
        throw new Error(response.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "bot",
        content: error.message || t('aiConsultant.error', "The AI Consultant is temporarily unavailable. Please try again.")
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col bg-gray-50 rounded-3xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('aiConsultant.title', "AI Medical Consultant")}</h2>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> {t('aiConsultant.poweredBy', "Powered by Gemini")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          <Languages className="w-4 h-4" />
          {t('aiConsultant.autoTranslating', "Auto-Translating")} ({i18n.language?.toUpperCase() || 'EN'})
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: "#f9fafb" }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"
              }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed ${msg.role === "user"
              ? "bg-emerald-600 text-white rounded-tr-none"
              : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
              }`}>
              {/* Simple formatting for markdown-like bold/list from Gemini */}
              {(msg.isWelcome ? t('aiConsultant.welcome', "Hello! I am your MedAssist AI consultant. How can I help you today? Please note that I am an AI, not a doctor. Always consult a real doctor for medical emergencies.") : msg.content).split('\\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2 text-emerald-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-semibold">{t('aiConsultant.consulting', "Consulting AI...")}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiConsultant.placeholder', "Describe your symptoms or ask a health question...")}
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-3">
          {t('aiConsultant.disclaimer', "AI Consultant can make mistakes. Consider verifying critical medical information with a doctor.")}
        </p>
      </div>
    </div>
  );
}
