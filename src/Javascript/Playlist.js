const type = false;

function Playlist( { playlist, onRemoveTrack, playlistName, handlePlaylistNameChange, onSavePlaylist } ) {
  function givInformation(e) {
    e.preventDefault();
    if (onSavePlaylist) {
      onSavePlaylist();
    }
  }

  return (
    <div className="Playlist">
      <form onSubmit={givInformation}>
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
        <button className="saveToSpotify" type="submit">SAVE TO SPOTIFY</button>
      </form>
    </div>
  );
}

export default Playlist;