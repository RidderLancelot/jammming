import '../styles/App.css';
import '../styles/Header.css';
import SearchBar from './SearchBar';
import Playlist from './Playlist';
import Tracklist from './Tracklist';
import { useState, useEffect } from 'react';
import { searchTracks, savePlaylistToSpotify } from './Spotify';

function App() {
  const [playlist, setPlaylist] = useState([]); // Start with an empty playlist
  const [playlistName, setPlaylistName] = useState("Baddest Motherfucker");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleFix(e) {
      setPlaylist(e.detail.map((track, i) => ({ ...track, index: i + 1 })));
    }
    window.addEventListener('fixPlaylistDuplicates', handleFix);
    return () => window.removeEventListener('fixPlaylistDuplicates', handleFix);
  }, []);

  function addTrackToPlaylist(track) {
    setPlaylist((prevPlaylist) => [...prevPlaylist, { ...track, index: prevPlaylist.length + 1, uri: track.uri || `spotify:track:${track.id}` }]);
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

  async function handleSearch(query) {
    setLoading(true);
    const results = await searchTracks(query);
    setSearchResults(results);
    setLoading(false);
  }

  async function handleSavePlaylist() {
    setSaving(true);
    const uris = playlist.map(track => track.uri);
    try {
      await savePlaylistToSpotify(playlistName, uris);
      alert('Playlist saved to your Spotify account!');
      setPlaylist([]);
    } catch (e) {
      alert(e.message || 'Failed to save playlist. Please try again.');
    }
    setSaving(false);
  }

  return (
    <div className="all">
      <SearchBar onSearch={handleSearch} />
      <div className='flex'>
        <div className="SearchResults">
          <h1>Results</h1>
          {loading ? <p>Loading...</p> : <Tracklist tracks={searchResults} onAddTrack={addTrackToPlaylist} />}
        </div>
        <Playlist playlist={playlist} onRemoveTrack={removeTrackFromPlaylist} playlistName={playlistName} handlePlaylistNameChange={handlePlaylistNameChange} onSavePlaylist={handleSavePlaylist} />
      </div>
      {saving && <p>Saving playlist to Spotify...</p>}
    </div>
  );
}

export default App;
