import React, { useState } from 'react';
import { Header } from "./components/Header";
import SearchBar from "./components/SearchBar";
import ShowResults from "./components/ShowResults";
import { Outlet } from 'react-router-dom';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchTerm) => {
    // Reset states
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/query', {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query_text: searchTerm }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app flex flex-col h-screen">
      <Header />

      {/* Main content container */}
      <div className="flex flex-grow w-full space-x-4 rounded-xl mb-1">

        {/* Left Sidebar (for sources or additional content) */}
        <div className="w-1/4 bg-gray-100 p-4 rounded-xl">
          <h2 className="text-xs mb-6">Sources</h2>
          <hr className="border-t-2 border-gray-300 mb-4" />
          {/* You can add your left sidebar content here */}
        </div>

        {/* Middle Section (for displaying results) */}
        <div className="flex-1 p-4 bg-white overflow-y-auto rounded-xl shadow-md flex flex-col">
          <h2 className="text-xs mb-6">Results</h2>
          <hr className="border-t-2 border-gray-300 mb-4" />
          
          {loading && (
            <div className="flex justify-center items-center mt-6">
              <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
              <p className="ml-4 text-lg">Thinking...</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 mt-6">{`Error: ${error}`}</p>
          )}
          
          {/* Content Area for ShowResults */}
          <div id="results-container" className="mt-6 flex-grow">
            {results && <ShowResults data={results} />}
          </div>

          {/* SearchBar to make the query */}
          <div className="w-full pt-3 rounded-xl mt-4 self-end">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Right Sidebar (for notes, other controls, etc.) */}
        <div className="w-1/4 bg-gray-50 p-4 rounded-xl">
          <h2 className="text-xs mb-6">Options</h2>
          <hr className="border-t-2 border-gray-300 mb-4" />
          {/* You can add additional content like notes here */}
        </div>
      </div>
      
    </div>
  );
}

export default App;