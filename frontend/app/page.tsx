// frontend/src/app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { askLegalQuestionStream, Message } from "../services/api";
import ReactMarkdown from "react-markdown";
import { supabase } from "../lib/supabase"; // <-- Supabase Import

// Types matching Database Schema
type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type DbMessage = {
  id?: string;
  session_id: string;
  role: "user" | "ai";
  content: string;
  created_at?: string;
};

// Small reusable logo mark
const LogoMark = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3v18M7 21h10M5 7l3.5-1.5M19 7l-3.5-1.5M5 7L2 13a3 3 0 0 0 6 0L5 7ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6ZM8.5 5.5 12 4l3.5 1.5"
      stroke="#A67C3D"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Only hold messages for the active session
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch Sessions from Supabase on Load
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      setSessions(data);
      setActiveId(data[0].id);
    } else {
      createNewChat();
    }
  };

  // 2. Fetch Messages when active session changes
  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
    }
  }, [activeId]);

  const fetchMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (data) {
      const formattedMessages = data.map((msg: DbMessage) => ({
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
    scrollToBottom();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Create a New Chat in Supabase
  const createNewChat = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert([{ title: "New Legal Query" }])
      .select();

    if (data && data[0]) {
      setSessions((prev) => [data[0], ...prev]);
      setActiveId(data[0].id);
      setMessages([]);
    }
  };

  // 4. Handle Send & Save to Supabase
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;

    const userMsg = input.trim();
    setInput("");

    // A. Update UI immediately
    const currentMessages: Message[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages([...currentMessages, { role: "ai", content: "" }]);
    setLoading(true);

    // B. Save User message to DB
    await supabase
      .from("messages")
      .insert([{ session_id: activeId, role: "user", content: userMsg }]);

    // C. Update Session Title if it's the first message
    if (messages.length === 0) {
      const chatTitle =
        userMsg.length > 25 ? userMsg.substring(0, 25) + "..." : userMsg;
      await supabase
        .from("chat_sessions")
        .update({ title: chatTitle, updated_at: new Date().toISOString() })
        .eq("id", activeId);

      setSessions((prev) =>
        prev.map((s) => (s.id === activeId ? { ...s, title: chatTitle } : s)),
      );
    }

    // D. Call API Stream and Save AI response
    try {
      let fullAiResponse = "";
      await askLegalQuestionStream(userMsg, currentMessages, (chunk) => {
        fullAiResponse += chunk;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex].content = fullAiResponse;
          return updatedMessages;
        });
        setLoading(false);
      });

      // After stream finishes, save the final AI answer to DB
      if (fullAiResponse) {
        await supabase
          .from("messages")
          .insert([
            { session_id: activeId, role: "ai", content: fullAiResponse },
          ]);
      }
    } catch (error) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].content =
          "Sorry, an error occurred while fetching the answer. Please check if the backend is running.";
        return updatedMessages;
      });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EFEBE0] flex font-sans overflow-hidden">
      {/* Sidebar Section */}
      <div className="w-64 bg-[#182848] text-white flex-col hidden md:flex border-r border-[#101b30]">
        <div className="p-5 border-b border-[#233560]">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[#A67C3D] hover:bg-[#8e6931] text-white px-4 py-3 rounded-lg font-medium transition duration-200 shadow-md"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-[#B9C2D6] font-semibold uppercase tracking-wider mb-4 ml-2">
            Recent Chats
          </p>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveId(session.id)}
              className={`w-full text-left truncate px-4 py-3 rounded-lg transition text-sm ${
                activeId === session.id
                  ? "bg-[#233560] text-white shadow-inner border-l-4 border-[#A67C3D]"
                  : "text-[#B9C2D6] hover:bg-[#233560]/50"
              }`}
            >
              💬 {session.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Container Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8">
        {/* Mobile Header */}
        <div className="absolute top-0 left-0 right-0 bg-[#182848] px-6 py-4 flex items-center justify-between md:hidden shadow-md z-10">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <h1 className="text-xl font-serif font-bold text-white">
              Legal AI
            </h1>
          </div>
          <button
            onClick={createNewChat}
            className="text-[#A67C3D] font-medium"
          >
            + New
          </button>
        </div>

        {/* Chat Box UI */}
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[85vh] border border-[#E2DFD3] mt-14 md:mt-0">
          {/* Chat Header */}
          <div className="bg-[#182848] px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <LogoMark size={22} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-serif font-semibold text-white tracking-tight">
                Sri Lankan Legal AI
              </h1>
              <p className="text-[#B9C2D6] text-sm">
                Your friendly legal assistant
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#B9C2D6] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#6FCF97]" />
              Online
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F7F4EC]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#182848]/5 flex items-center justify-center">
                  <LogoMark size={26} />
                </div>
                <p className="font-serif text-lg text-[#182848]">
                  Ask me anything, legally speaking
                </p>
                <p className="text-sm text-gray-500 max-w-sm">
                  I'm here to help with your legal questions — just type below
                  to get started.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-[#182848] flex items-center justify-center flex-shrink-0 mb-1">
                      <LogoMark size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#182848] text-white rounded-2xl rounded-br-sm shadow-md"
                        : "bg-white text-gray-800 border-l-[3px] border-[#A67C3D] rounded-r-2xl rounded-tl-2xl shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:font-serif prose-headings:font-semibold prose-a:text-[#182848]">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#182848] flex items-center justify-center flex-shrink-0 mb-1">
                  <LogoMark size={14} />
                </div>
                <div className="bg-white border-l-[3px] border-[#A67C3D] px-5 py-4 rounded-r-2xl rounded-tl-2xl shadow-sm flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-[#A67C3D] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#A67C3D] rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1.5 h-1.5 bg-[#A67C3D] rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Area */}
          <div className="bg-white px-6 py-4 border-t border-[#E2DFD3]">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 appearance-none rounded-full border border-[#E2DFD3] bg-[#F7F4EC] px-6 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A67C3D] focus:border-transparent placeholder:text-gray-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#182848] text-white rounded-full px-6 py-3 font-medium hover:bg-[#233560] disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
