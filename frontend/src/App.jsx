import React, { useState } from 'react';
import { Header } from "./components/Header";
import SearchBar from "./components/SearchBar";
import ShowResults from "./components/ShowResults";
import { data } from './data/data';
import { Outlet } from 'react-router-dom';

function App() {
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    setResults(data);
  };

  return (
    <main className="app">
      <Header />
      <Outlet />
      <SearchBar onSearch={handleSearch} />
      <div id="results-container">
        {results && <ShowResults data={results} />}
      </div>
    </main>
  );
}

export default App;
