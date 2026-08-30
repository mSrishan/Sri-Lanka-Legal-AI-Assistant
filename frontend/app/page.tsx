// frontend/src/app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { askLegalQuestion, Message } from "../services/api";
import ReactMarkdown from "react-markdown"; // <-- අලුතින් එක් කළ Import එක

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const responseText = await askLegalQuestion(userMsg, messages);
      setMessages([...newMessages, { role: "ai", content: responseText }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content:
            "Sorry, an error occurred while fetching the answer. Please check if the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Chat Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Sri Lankan Legal AI ⚖️
            </h1>
            <p className="text-blue-100 text-sm">
              Ask your legal questions based on provided Acts
            </p>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Start a conversation by typing a question below...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 text-base ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none"
                  }`}
                >
                  {/* Markdown Render කරන කොටස */}
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-blue max-w-none prose-p:leading-relaxed prose-headings:font-semibold">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-500 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Area */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 appearance-none rounded-full border border-gray-300 px-6 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
