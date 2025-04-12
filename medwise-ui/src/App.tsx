import QueryForm from "./components/QueryForm";

function App() {
  return (
    <div className="min-h-screen w-screen bg-white text-gray-900">
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <QueryForm />
        </div>
      </div>
    </div>
  );
}

export default App;
