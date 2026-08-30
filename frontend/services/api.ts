// frontend/src/services/api.ts

export const askLegalQuestion = async (question: string) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error("සර්වර් එක හා සම්බන්ධ වීමේ දෝෂයක් ඇත.");
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
