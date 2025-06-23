import { useState } from 'react';

function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  function handleChange(e) {
    setInput(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  }

  return (
    <div className="searchbar">
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="search" 
          placeholder="Enter A Song Title" 
          className="SearchField" 
          value={input} 
          onChange={handleChange} 
        />
        <br />
        <input type="submit" value="Search" className="SearchButton" />
      </form>
    </div>
  );
}

export default SearchBar;
