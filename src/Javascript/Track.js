function Track(songName, singer, album, type) {
  return (
    <div className="Track">
      <h4 className="SongName">{songName} <span onClick={clicking} className="type">{type ? "+" : "-"}</span></h4>
      <p className="SongInfo">{singer} | {album}</p>
    </div>
  );
}

function clicking(e) {
  e.preventDefault();
  alert(e.name);
}

export default Track;
