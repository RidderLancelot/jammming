import '../styles/App.css';
import SearchBar from './SearchBar';
import Playlist from './Playlist';
import SearchResults from './SearchResults';

function App() {
  return (
    <div className="all">
      <div className="App">
        <header className="App-header">
          <h1>Ja<span className="purple">mmm</span>ing</h1>
        </header>
      </div>
      <SearchBar />
      <div className='flex'>
        <SearchResults />
        <Playlist />
      </div>
      <p>Jeg vil gerne have en knap, hvor man kan se mine mest lyttede sange+kunstnere i hver måned(5)+år(10)</p>
    </div>
  );
}

export default App;
