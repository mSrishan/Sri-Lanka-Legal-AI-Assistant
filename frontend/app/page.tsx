// frontend/src/app/page.tsx
"use client";

import { useState } from "react";
import { askLegalQuestion } from "../services/api";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const responseText = await askLegalQuestion(question);
      setAnswer(responseText);
    } catch (error) {
      setAnswer(
        "Sorry, an error occurred while fetching the answer. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Sri Lankan Legal AI{" "}
            <span className="text-blue-600">Assistant ⚖️</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Ask any legal question based on Sri Lankan Acts (Companies Act, EPF,
            VAT, etc.)
          </p>
        </div>

        {/* Input Form Section */}
        <form
          onSubmit={handleAskAI}
          className="mt-8 flex gap-3 shadow-sm rounded-md"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your legal question here..."
            className="flex-1 appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-3 md:text-lg md:px-10 transition duration-150 ease-in-out ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Searching..." : "Ask"}
          </button>
        </form>

        {/* Answer Display Section */}
        {answer && (
          <div className="mt-8 bg-white overflow-hidden shadow rounded-xl border-l-4 border-blue-500 transition-all duration-500 ease-in-out">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">
                AI Generated Answer:
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                {answer}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
