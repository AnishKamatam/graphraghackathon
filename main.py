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
- BrandDrug(name, price, quantity, retailer, source)
- GenericDrug(name, price, quantity, retailer, source)
- Company(name)

Relationships:
- (:BrandDrug)-[:HAS_GENERIC]->(:GenericDrug)
- (:BrandDrug)-[:OWNED_BY]->(:Company)

Notes:
- HAS_GENERIC only goes from BrandDrug → GenericDrug. Do NOT reverse this.
- GenericDrug is NOT connected to Company.
- Use MATCH with a proper relationship, e.g. MATCH (a)-[:REL]->(b)
- Never use MATCH (a)-(b) without specifying a relationship type.
- Price is a property on GenericDrug.
- To find who owns Tylenol:
  MATCH (:BrandDrug {name: "Tylenol"})-[:OWNED_BY]->(c:Company)
  RETURN c.name
- To find the cheapest generic for Advil:
  MATCH (:BrandDrug {name: "Advil"})-[:HAS_GENERIC]->(g:GenericDrug)
  RETURN g.name, g.price
  ORDER BY g.price ASC
  LIMIT 1
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
