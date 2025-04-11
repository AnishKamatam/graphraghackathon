import os
from dotenv import load_dotenv
from langchain_community.graphs import Neo4jGraph  # ✅ Use community version for now
from langchain_community.chains.graph_qa.cypher import GraphCypherQAChain
from langchain_ollama import OllamaLLM

# Load credentials
load_dotenv()

# Connect to Neo4j
graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USER"),
    password=os.getenv("NEO4J_PASSWORD")
)

# Connect to Ollama (make sure you're running: ollama run mistral)
llm = OllamaLLM(model="mistral")

# Create the QA chain (with permission flag)
chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,
    allow_dangerous_requests=True
)

# Interactive Q&A loop
def ask_question():
    print("\n💊 Ask anything about your drug graph (type 'exit' to quit):")
    while True:
        query = input(">> ")
        if query.lower() in ["exit", "quit"]:
            break
        try:
            result = chain.invoke({"query": query})
            print("🧠", result, "\n")
        except Exception as e:
            print("⚠️", e)

if __name__ == "__main__":
    ask_question()
