import { useState } from "react";
import DrugCard from "./DrugCard";

interface SideEffect {
  name: string;
  severity: string;
}

interface Retailer {
  name: string;
  url?: string;
}

interface DrugInfo {
  name: string;
  price: number;
  quantity: string;
  dosage: string;
  description: string;
  source: string;
  retailer?: Retailer;
  sideEffects?: SideEffect[];
}

interface Response {
  brand?: string;
  generic?: DrugInfo;
  alternatives?: DrugInfo[];
  error?: string;
}

export default function QueryForm() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("http://localhost:5051/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError("Failed to connect to the server");
      console.error("Error:", err);
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

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="flex flex-col items-center gap-6 mt-6 w-full max-w-4xl">
          {response.brand && (
            <DrugCard 
              title="Brand" 
              drug={{
                name: response.brand,
                price: 0,
                quantity: "N/A",
                dosage: "N/A",
                description: "Brand name medication",
                source: "MedWise Database"
              }} 
            />
          )}
          {response.generic && (
            <DrugCard title="Generic" drug={response.generic} />
          )}
          <div className="flex flex-wrap gap-4 justify-center w-full">
            {response.alternatives?.map((alt, i) => (
              <DrugCard key={i} title={`Alternative ${i + 1}`} drug={alt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
