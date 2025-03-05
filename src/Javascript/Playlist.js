import Track from "./Track";
import TopTracks from "./Song";

const type = false;

function Playlist() {
  return (
    <div className="Playlist">
      <h1>Playlist</h1>
      <div className="Tracklist">
        {Track("wish i loved you in the 90s", "Tate Mcrae", "Too Young to Be Sad", type)}
        {TopTracks()}
      </div>
    </div>
  );
}


export default (Playlist);
