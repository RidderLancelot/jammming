import { useState } from "react";

const type = true;

function Tracklist( {onAddTrack} ) {
  const [tracks] = useState([
    { name: "bad ones", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "6CYT0souHUHKTO4EMzTUFg" },
    { name: "slower", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "4X3Br7EVc8oy44zUwU1z5w" },
    { name: "you broke me first", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "4l0RmWt52FxpVxMNni6i63" },
    { name: "rubberband", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "2E8IlL26PwtZq7CqAHBBUw" },
    { name: "r u ok", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "2ng0NW0HhJK0KTNZzZajRv" },
    { name: "wish i loved you in the 90s", artists: ["Tate Mcrae"], album: "Too Young to Be Sad", id: "2wkIdVB8HsWyMur3Q4shlZ" }
  ]);


  
  return (
    <div className="Tracklist">
      {tracks.map((track, index) => (
        <div key={index} className="Track" artists={track.artists} songName={track.name}>
          <h4 className="SongName">
            {track.name} <span onClick={() => onAddTrack(track)} className="type">{type ? "+": "-"}</span>
          </h4>
          <p className="SongInfo">
            {track.artists.map(artist => artist).join(', ')} | {track.album}
          </p>
        </div>
      ))}
    </div>
  );
}



export default (Tracklist);
