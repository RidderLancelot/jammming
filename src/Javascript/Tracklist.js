import { useState } from "react";

function Tracklist( { tracks = [], onAddTrack} ) {
  const type = true;
  return (
    <div className="Tracklist">
      {tracks.map((track, index) => (
        <div key={track.id || index} className="Track" artists={track.artists} songName={track.name}>
          <h4 className="SongName">
            {track.name} <span onClick={() => onAddTrack(track)} className="type">{type ? "+": "-"}</span>
          </h4>
          <p className="SongInfo">
            {track.artists.join(', ')} | {track.album}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Tracklist;
