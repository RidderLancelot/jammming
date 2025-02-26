function Track(songName, singer, album) {
  return (
    <div className="Track">
      <h4 className="SongName">{songName}</h4>
      <p className="SongInfo">{singer} | {album}</p>
    </div>
  );
}

export default Track;
