// frontend/src/services/api.ts

export type Message = {
  role: "user" | "ai";
  content: string;
};

export const askLegalQuestionStream = async (
  question: string,
  history: Message[],
  onChunk: (chunk: string) => void,
) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, history }),
    });

    if (!response.ok) {
      throw new Error("Server connection error.");
    }

    if (!response.body) throw new Error("No response body.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    // Read the stream chunk by chunk
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk); // Send the chunk back to the UI
      }
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
