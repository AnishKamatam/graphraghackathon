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
  company?: string;
}

interface Response {
  brand: DrugInfo;
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
      console.log("Sending request for:", question);
      const res = await fetch("http://localhost:5051/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      console.log("Received response:", data);
      
      if (data.error) {
        setError(data.error);
      } else {
        // Ensure all required fields are present
        const processedData: Response = {
          brand: {
            name: data.brand.name,
            price: data.brand.price || 0,
            quantity: data.brand.quantity || "N/A",
            dosage: data.brand.dosage || "N/A",
            description: data.brand.description || "Brand name medication",
            source: data.brand.source || "MedWise Database",
            company: data.brand.company,
            sideEffects: data.brand.sideEffects || [],
            retailer: data.brand.retailer
          },
          generic: data.generic ? {
            name: data.generic.name,
            price: data.generic.price || 0,
            quantity: data.generic.quantity || "N/A",
            dosage: data.generic.dosage || "N/A",
            description: data.generic.description || "Generic alternative",
            source: data.generic.source || "MedWise Database",
            retailer: data.generic.retailer,
            sideEffects: data.generic.sideEffects || []
          } : undefined,
          alternatives: data.alternatives?.map((alt: any) => ({
            name: alt.name,
            price: alt.price || 0,
            quantity: alt.quantity || "N/A",
            dosage: alt.dosage || "N/A",
            description: alt.description || "Alternative medication",
            source: alt.source || "MedWise Database",
            retailer: alt.retailer,
            sideEffects: alt.sideEffects || []
          }))
        };
        
        setResponse(processedData);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to connect to the server");
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
          placeholder="Enter a drug name (e.g., Dramamine)"
          className="w-full h-16 px-6 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          className="px-6 py-3 text-lg rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-8 w-full max-w-6xl">
          <div className="flex flex-row gap-6 overflow-x-auto pb-4">
            {response.brand && (
              <div className="flex-shrink-0">
                <DrugCard title="Brand" drug={response.brand} />
              </div>
            )}
            {response.generic && (
              <div className="flex-shrink-0">
                <DrugCard title="Generic" drug={response.generic} />
              </div>
            )}
            {response.alternatives?.map((alt, i) => (
              <div key={i} className="flex-shrink-0">
                <DrugCard title={`Alternative ${i + 1}`} drug={alt} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
