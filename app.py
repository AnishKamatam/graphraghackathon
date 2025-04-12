from flask import Flask, request, jsonify
from flask_cors import CORS
from main import chain  # Uses your LangChain GraphCypherQAChain

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    query = data.get("question", "")
    
    if not query:
        return jsonify({"error": "No question provided"}), 400

    try:
        result = chain.invoke({"query": query})
        return jsonify({"answer": result["result"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5050)
