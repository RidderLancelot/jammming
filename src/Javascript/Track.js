function Track(songName, singer, album, type) {
  return (
    <div className="Track">
      <h4 className="SongName">{songName} <span onClick={alert} className="type">{type ? "+" : "-"}</span></h4>
      <p className="SongInfo">{singer} | {album}</p>
    </div>
  );
}


export default Track;
