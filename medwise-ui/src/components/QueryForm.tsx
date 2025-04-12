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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">💊 MedWise</h1>
      <p className="mb-4 text-gray-700">Ask about brand-name drugs, generic alternatives, and prices.</p>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. What is the cheapest generic for Zyrtec?"
        className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Asking..." : "Ask MedWise"}
      </button>

      {answer && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-600 text-green-800 rounded">
          <strong>🧠 Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
}
