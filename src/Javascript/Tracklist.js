import Track from "./Track";

function Tracklist() {
  return (
    <div className="Tracklist">
      {Track("bad ones", "Tate Mcrae", "Too Young to Be Sad")}
      {Track("r u ok", "Tate Mcrae", "Too Young to Be Sad")}
      {Track("you broke me first", "Tate Mcrae", "Too Young to Be Sad")}
      {Track("slower", "Tate Mcrae", "Too Young to Be Sad")}
      {Track("rubberband", "Tate Mcrae", "Too Young to Be Sad")}
      {Track("wish i loved you in the 90s", "Tate Mcrae", "Too Young to Be Sad")}
    </div>
  );
}

export default Tracklist;
