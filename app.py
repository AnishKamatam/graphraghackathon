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
        
        # Brand drug information
        brand = {
            "name": result["brand"],
            "price": result.get("brandPrice", 0),
            "quantity": result.get("brandQuantity", "N/A"),
            "dosage": result.get("brandDosage", "N/A"),
            "description": result.get("brandDescription", "Brand name medication"),
            "source": result.get("brandSource", "MedWise Database"),
            "company": result.get("company", "N/A"),
            "sideEffects": result.get("brandSideEffects", []),
            "retailer": result.get("brandRetailer")
        }
        
        # Generic drug information
        generic = None
        if result.get("genericName"):
            generic = {
                "name": result["genericName"],
                "price": result.get("genericPrice", 0),
                "quantity": result.get("genericQuantity", "N/A"),
                "dosage": result.get("genericDosage", "N/A"),
                "description": result.get("genericDescription", "Generic alternative"),
                "source": result.get("genericSource", "MedWise Database"),
                "retailer": result.get("genericRetailer"),
                "sideEffects": result.get("genericSideEffects", [])
            }

        # Alternative drugs
        alternatives = []
        for alt in result.get("alternatives", []):
            alternatives.append({
                "name": alt.get("name", "Unknown"),
                "price": alt.get("price", 0),
                "quantity": alt.get("quantity", "N/A"),
                "dosage": alt.get("dosage", "N/A"),
                "description": alt.get("description", "Alternative medication"),
                "source": alt.get("source", "MedWise Database"),
                "retailer": alt.get("retailer"),
                "sideEffects": alt.get("sideEffects", [])
            })

        return jsonify({
            "brand": brand,
            "generic": generic,
            "alternatives": alternatives
        })
    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5051)
