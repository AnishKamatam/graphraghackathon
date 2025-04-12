from flask import Flask, request, jsonify
from flask_cors import CORS
from main import get_drug_info

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    drug_name = data.get("question", "").strip()

    if not drug_name:
        return jsonify({"error": "No question provided"}), 400

    try:
        results = get_drug_info(drug_name)
        if not results:
            return jsonify({"error": "Drug not found"}), 404

        result = results[0]
        brand = {
            "name": result["brand"],
            "price": 0,  # Brand price not currently stored
            "quantity": "N/A",
            "dosage": "N/A",
            "description": "Brand name medication",
            "source": "MedWise Database"
        }

        generic = None
        if result["genericName"]:
            generic = {
                "name": result["genericName"],
                "price": result["genericPrice"],
                "quantity": result["genericQuantity"],
                "dosage": "N/A",
                "description": "Generic alternative",
                "source": "MedWise Database"
            }

        alternatives = []
        for alt in result["alternatives"]:
            alternatives.append({
                "name": alt["name"],
                "price": alt["price"],
                "quantity": alt["quantity"],
                "dosage": alt.get("dosage", "N/A"),
                "description": alt.get("description", "Alternative medication"),
                "source": alt.get("source", "MedWise Database"),
                "retailer": alt.get("retailer")
            })

        return jsonify({
            "brand": brand,
            "generic": generic,
            "alternatives": alternatives
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5051)
