import Track from "./Track";

const type = true;

function Tracklist() {
  return (
    <div className="Tracklist">
      {Track("bad ones", "Tate Mcrae", "Too Young to Be Sad", type)}
      {Track("r u ok", "Tate Mcrae", "Too Young to Be Sad", type)}
      {Track("you broke me first", "Tate Mcrae", "Too Young to Be Sad", type)}
      {Track("slower", "Tate Mcrae", "Too Young to Be Sad", type)}
      {Track("rubberband", "Tate Mcrae", "Too Young to Be Sad", type)}
      {Track("wish i loved you in the 90s", "Tate Mcrae", "Too Young to Be Sad", type)}
    </div>
  );
}


export default Tracklist;
