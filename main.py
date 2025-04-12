import os
from dotenv import load_dotenv
from langchain_community.graphs import Neo4jGraph
from langchain_community.chains.graph_qa.cypher import GraphCypherQAChain
from langchain_community.chains.graph_qa.prompts import CYPHER_GENERATION_PROMPT
from langchain_ollama import OllamaLLM

# Load environment variables from .env file
load_dotenv()

# Connect to Neo4j Aura
graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USER"),
    password=os.getenv("NEO4J_PASSWORD")
)

# Connect to local Ollama model (e.g., mistral)
llm = OllamaLLM(model="mistral")

# Strongly guide the LLM using a fine-tuned prompt
custom_prompt = CYPHER_GENERATION_PROMPT.partial(
    schema="""
Nodes:
- BrandDrug:
    - name (string)
    - price (float)
    - quantity (string)
    - dosage (string)
    - description (string)
    - source (string)

- GenericDrug:
    - name (string)
    - price (float)
    - quantity (string)
    - dosage (string)
    - description (string)
    - source (string)

- Company:
    - name (string)

- Retailer:
    - name (string)
    - url (string)

- SideEffect:
    - name (string)
    - severity (string: mild, moderate, severe)

Relationships:
- (:BrandDrug)-[:HAS_GENERIC]->(:GenericDrug)
- (:BrandDrug)-[:OWNED_BY]->(:Company)
- (:BrandDrug)-[:HAS_SIDE_EFFECT]->(:SideEffect)
- (:GenericDrug)-[:HAS_SIDE_EFFECT]->(:SideEffect)
- (:GenericDrug)-[:AVAILABLE_AT]->(:Retailer)

Usage Notes:
- All nodes and relationships should be explicitly typed (e.g., `[:HAS_GENERIC]`).
- Prices are stored as numbers (floats) for both brand and generic drugs.
- `dosage`, `quantity`, and `description` fields help users understand medical use.
- Retailer relationships indicate where a drug can be purchased.
- SideEffect severity is useful for filtering or comparisons.
"""
)


# Set up the GraphCypherQAChain with prompt
chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    cypher_prompt=custom_prompt,
    verbose=True,  # Will print Cypher being generated
    allow_dangerous_requests=True
)

# CLI for asking natural language questions
def ask_question():
    print("\n🧪 Ask a question about your drug knowledge graph (type 'exit' to quit):")
    while True:
        user_input = input(">> ")
        if user_input.lower() in ["exit", "quit"]:
            break
        try:
            print("\n🔄 Generating Cypher query...\n")
            result = chain.invoke({"query": user_input})
            print("\n🧠 Answer:", result, "\n")
        except Exception as e:
            print("⚠️ Error:", e)

# Batch test all 10 drugs
def test_all_cheapest_generics():
    brand_drugs = [
        "Advil", "Mucinex", "Claritin", "Zyrtec", "Tylenol",
        "Aleve", "Pepto-Bismol", "Benadryl", "Robitussin", "Dramamine"
    ]
    print("\n🧪 Running test queries for cheapest generic alternatives:\n")
    for drug in brand_drugs:
        query = f"What is the cheapest generic alternative to {drug}?"
        print(f"🔍 {query}")
        try:
            result = chain.invoke({"query": query})
            print(f"🧠 Answer: {result['result']}\n")
        except Exception as e:
            print(f"⚠️ Error with {drug}: {e}\n")

# Select mode when running the file
if __name__ == "__main__":
    mode = input("\n🌐 Select mode:\n1️⃣  CLI (ask questions)\n2️⃣  Test all cheapest generics\nEnter 1 or 2: ")

    if mode.strip() == "1":
        ask_question()
    elif mode.strip() == "2":
        test_all_cheapest_generics()
    else:
        print("❌ Invalid option. Please enter 1 or 2.")

def get_drug_info(drug_name: str):
    query = f"""
    MATCH (b:BrandDrug {{name: "{drug_name}"}})
    OPTIONAL MATCH (b)-[:HAS_GENERIC]->(g:GenericDrug)
    OPTIONAL MATCH (g)-[:AVAILABLE_AT]->(r:Retailer)
    OPTIONAL MATCH (g)-[:HAS_SIDE_EFFECT]->(se:SideEffect)
    WITH b, g, r, se
    ORDER BY g.price ASC
    RETURN 
        b.name AS brand,
        b.price AS brandPrice,
        b.quantity AS brandQuantity,
        b.dosage AS brandDosage,
        b.description AS brandDescription,
        b.source AS brandSource,
        COLLECT(DISTINCT {{
            name: g.name,
            price: g.price,
            quantity: g.quantity,
            dosage: g.dosage,
            description: g.description,
            source: g.source,
            retailer: {{
                name: r.name,
                url: r.url
            }}
        }}) AS generics,
        COLLECT(DISTINCT {{
            name: se.name,
            severity: se.severity
        }}) AS sideEffects
    LIMIT 1
    """
    results = graph.query(query)
    if not results:
        return None
        
    result = results[0]
    return [{
        "brand": result["brand"],
        "genericName": result["generics"][0]["name"] if result["generics"] else None,
        "genericPrice": result["generics"][0]["price"] if result["generics"] else None,
        "genericQuantity": result["generics"][0]["quantity"] if result["generics"] else None,
        "alternatives": result["generics"][1:] if len(result["generics"]) > 1 else [],
        "sideEffects": result["sideEffects"]
    }]