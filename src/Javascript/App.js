import '../styles/App.css';
import '../styles/Header.css';
import SearchBar from './SearchBar';
import Playlist from './Playlist';
import Tracklist from './Tracklist';
import { useState } from 'react';

function App() {
  const [playlist, setPlaylist] = useState([
    { index: 1, name: "bad ones", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "6CYT0souHUHKTO4EMzTUFg" }
  ]);
  const [playlistName, setPlaylistName] = useState("Baddest Motherfucker");

  function addTrackToPlaylist(track) {
    setPlaylist((prevPlaylist) => [...prevPlaylist, {...track, index: prevPlaylist.length + 1}]);
  }

  const handlePlaylistNameChange = (event) => {
    setPlaylistName(event.target.value);
  };

  function removeTrackFromPlaylist(index) {
    setPlaylist((prevPlaylist) => {
      const updatedPlaylist = prevPlaylist.filter((track) => track.index !== index);

      return updatedPlaylist.map((track, index) => ({
        ...track,
        index: index + 1, 
      }));
    });
  }

  return (
    <div className="all">
      <div className="App">
        <header className="App-header">
          <h1>Ja<span className="purple">mmm</span>ing</h1>
        </header>
      </div>
      <SearchBar />
      <div className='flex'>
        <div className="SearchResults">
          <h1>Results</h1>
          <Tracklist onAddTrack={addTrackToPlaylist} />
        </div>
        <Playlist playlist={playlist} onRemoveTrack={removeTrackFromPlaylist} playlistName={playlistName} handlePlaylistNameChange={handlePlaylistNameChange} />
      </div>
      <p>Jeg vil gerne have en knap, hvor man kan se mine mest lyttede sange+kunstnere i hver måned(5)+år(10)</p>
    </div>
  );
}

export default App;
