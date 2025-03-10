const type = false;

function Playlist( { playlist, onRemoveTrack, playlistName, handlePlaylistNameChange} ) {
  function givInformation(e) {
    alert (
      "Playlisten: " + playlistName + ", har sangene: " + playlist.map((track) => (track.name)).join(', ')
    );
  }

  return (
    <div className="Playlist">
      <form>
        <input onChange={handlePlaylistNameChange} type="text" name="save-to-spotify" placeholder={playlistName} className="PlaylistName"></input>
        <div className="Tracklist">
          {playlist.map((track) => (
            <div key={track.index} className="Track">
              <h4 className="SongName">
                {track.name} <span onClick={() => onRemoveTrack(track.index)} className="type">{type ? "+": "-"}</span>
              </h4>
              <p className="SongInfo">
                {track.artists.map(artist => artist).join(', ')} | {track.album}
              </p>
            </div>
          ))}
        </div>
        <button className="saveToSpotify" onClick={givInformation}>SAVE TO SPOTIFY</button>
      </form>
    </div>
  );
}




export default (Playlist) ;