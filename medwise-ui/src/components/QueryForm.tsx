import { useState } from "react";

export default function QueryForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
        const res = await fetch("http://localhost:5050/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("⚠️ There was an error contacting the MedWise server.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">MedWise</h1>
      <div className="w-full max-w-2xl flex flex-col items-center gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full h-16 px-6 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          className="px-6 py-3 text-lg rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {loading ? "Asking..." : "Ask MedWise"}
        </button>
      </div>

      {answer && (
        <div className="w-full max-w-2xl mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-800">{answer}</p>
        </div>
      )}
    </div>
  );
}
