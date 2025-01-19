import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(''); // Manages the search term

  const performSearch = (event) => {
    event.preventDefault(); // Prevents the page from refreshing
    if (searchTerm.trim() === '') return; // Prevent search if the field is empty
    onSearch(searchTerm); // Calls the `onSearch` function with the entered term
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      performSearch(event); // Handles search on pressing Enter
    }
  };

  return (
    <form onSubmit={performSearch} className="search-container mx-auto">
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Make a consult here..."
          required
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearchTerm(e.target.value)} // Updates search term
        />
        <button
          type="submit"
          className="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Dig up
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
