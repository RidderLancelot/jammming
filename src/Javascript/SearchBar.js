function SearchBar() {
  return (
    <div className="searchbar">
      <form >
        <input type="text" name="search" placeholder="Enter A Song Title" className="SearchField"></input>
        <br></br>
        <input type="submit" value="Search" className="SearchButton"></input>
      </form>
    </div>
  );
}

export default SearchBar;
