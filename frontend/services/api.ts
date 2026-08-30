// frontend/src/services/api.ts

export type Message = {
  role: "user" | "ai";
  content: string;
};

export const askLegalQuestion = async (
  question: string,
  history: Message[],
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send both the question and the chat history
      body: JSON.stringify({ question, history }),
    });

    if (!response.ok) {
      throw new Error("Server connection error.");
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
