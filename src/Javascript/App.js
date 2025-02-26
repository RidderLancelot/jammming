import '../styles/App.css';
import SearchBar from './SearchBar';
import Playlist from './Playlist';
import SearchResults from './SearchResults';

function App() {
  return (
    <div className="all">
      <div className="App">
        <header className="App-header">
          <h1>Ja<a className="purple">mmm</a>ing</h1>
        </header>
      </div>
      <SearchBar />
      <SearchResults />
      <div className="Playlist">
        <Playlist />
      </div>
    </div>
  );
}

export default App;
