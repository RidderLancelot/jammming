import { useEffect, useState } from 'react';
import { getAccessToken } from './Spotify';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [fixing, setFixing] = useState(false);
  const [checked, setChecked] = useState(false); // Add a state to track if checkDuplicates was run
  const [checking, setChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);

  // Pagination state
  const [trackPage, setTrackPage] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const TRACKS_PER_PAGE = 100;

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to load playlists');
        const data = await response.json();
        setPlaylists(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  // Only fetch one page at a time for display
  async function fetchTracksPage(playlistId, page) {
    const token = getAccessToken();
    const offset = page * TRACKS_PER_PAGE;
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${TRACKS_PER_PAGE}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    return { items: data.items || [], total: data.total || 0 };
  }

  async function handleSelect(playlist) {
    setSelected(playlist);
    setTracksLoading(true);
    setTracks([]);
    setDuplicates([]);
    setChecked(false);
    setTrackPage(0);
    try {
      const { items, total } = await fetchTracksPage(playlist.id, 0);
      setTracks(items);
      setTotalTracks(total);
    } finally {
      setTracksLoading(false);
    }
  }

  // Pagination controls
  async function goToPage(page) {
    if (!selected) return;
    setTracksLoading(true);
    setTrackPage(page);
    try {
      const { items } = await fetchTracksPage(selected.id, page);
      setTracks(items);
    } finally {
      setTracksLoading(false);
    }
  }

  // For duplicate check, fetch all tracks in batches and show progress
  async function checkDuplicates() {
    if (!selected) return;
    setChecked(false);
    setDuplicates([]);
    setChecking(true);
    let allTracks = [];
    let offset = 0;
    let percent = 0;
    const token = getAccessToken();
    while (offset < totalTracks) {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${selected.id}/tracks?limit=100&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.items) allTracks = allTracks.concat(data.items);
      offset += 100;
      percent = Math.min(100, Math.round((offset / totalTracks) * 100));
      setCheckProgress(percent);
    }
    const count = {};
    for (const item of allTracks) {
      const id = item.track?.id;
      if (!id) continue;
      count[id] = (count[id] || 0) + 1;
    }
    const dups = Object.entries(count)
      .filter(([_, c]) => c > 1)
      .map(([id, c]) => {
        const track = allTracks.find(item => item.track?.id === id)?.track;
        return { id, name: track?.name, count: c };
      });
    setDuplicates(dups);
    setChecked(true);
    setChecking(false);
    setCheckProgress(0);
  }

  async function fixDuplicates() {
    setFixing(true);
    try {
      const token = getAccessToken();
      // Fetch all tracks in the playlist (not just paged)
      let allTracks = [];
      let offset = 0;
      while (offset < totalTracks) {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${selected.id}/tracks?limit=100&offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (data.items) allTracks = allTracks.concat(data.items);
        offset += 100;
      }
      // Find duplicates and their positions
      const seen = new Map(); // id -> [positions]
      allTracks.forEach((item, idx) => {
        const id = item.track?.id;
        if (!id) return;
        if (!seen.has(id)) seen.set(id, []);
        seen.get(id).push(idx);
      });
      // For each duplicate, remove all by URI, then re-add one at the first occurrence
      for (const [id, positions] of seen.entries()) {
        if (positions.length > 1) {
          const uri = allTracks[positions[0]].track.uri;
          // Remove all occurrences by URI
          await fetch(`https://api.spotify.com/v1/playlists/${selected.id}/tracks`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tracks: [{ uri }] }),
          });
          // Re-add one copy at the position of the first occurrence
          await fetch(`https://api.spotify.com/v1/playlists/${selected.id}/tracks`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [uri], position: positions[0] }),
          });
        }
      }
      // Refetch tracks after removal
      let newTracks = [];
      offset = 0;
      while (offset < totalTracks) {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${selected.id}/tracks?limit=100&offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (data.items) newTracks = newTracks.concat(data.items);
        offset += 100;
      }
      setTracks(newTracks);
      setDuplicates([]);
    } catch (e) {
      alert('Failed to update playlist on Spotify.');
      console.error(e);
    }
    setFixing(false);
  }

  // Pagination controls
  const pagedTracks = tracks.slice(trackPage * TRACKS_PER_PAGE, (trackPage + 1) * TRACKS_PER_PAGE);
  const totalPages = Math.ceil(tracks.length / TRACKS_PER_PAGE);

  return (
    <div className="PlaylistsPage" style={{maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(68,22,68,0.12)', padding: '2rem'}}>
      <h1 style={{textAlign:'center', color:'rgb(68,22,68)', marginBottom: '2rem'}}>Your Spotify Playlists</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{display:'flex', gap: '2rem'}}>
          <ul style={{listStyle:'none', padding:0, width:'40%', borderRight:'1px solid #eee', maxHeight: '400px', overflowY: 'auto'}}>
            {playlists.map((playlist) => (
              <li key={playlist.id} style={{marginBottom: 24, cursor:'pointer', background:selected?.id===playlist.id?'#f3e6fa':'transparent', borderRadius:8, padding:8, transition:'background 0.2s'}} onClick={() => handleSelect(playlist)}>
                <img src={playlist.images[0]?.url} alt="cover" width={64} height={64} style={{verticalAlign:'middle', borderRadius:8, boxShadow:'0 2px 8px rgba(68,22,68,0.08)', objectFit:'cover', width:64, height:64}} />
                <span style={{marginLeft: 16, fontWeight:600, color:'rgb(68,22,68)'}}>{playlist.name}</span>
                <span style={{marginLeft: 8, color:'#888', fontSize:12}}>{playlist.tracks.total} tracks</span>
              </li>
            ))}
          </ul>
          <div style={{flex:1, minWidth:0}}>
            {selected ? (
              <div>
                <h2 style={{color:'rgb(68,22,68)', marginBottom: 0}}>{selected.name}</h2>
                <div style={{display:'flex',alignItems:'center',gap:16,margin:'16px 0 24px 0'}}>
                  <button onClick={checkDuplicates} style={{padding:'0.5rem 1.2rem',background:'linear-gradient(90deg, #441644 60%, #a259c6 100%)',color:'#fff',border:'none',borderRadius:6,fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px rgba(68,22,68,0.08)',letterSpacing:1}} disabled={checking}>
                    {checking ? `Checking... ${checkProgress}%` : 'Check Duplicates'}
                  </button>
                  {duplicates.length > 0 && (
                    <div style={{background:'#fff0f6',color:'#a00',padding:'0.7rem 1.2rem',borderRadius:10,fontWeight:'bold',display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 8px #f3e6fa'}}>
                      <span style={{fontWeight:600, color:'#a00'}}>Duplicates: {duplicates.length} found</span>
                      <ul style={{margin:0,paddingLeft:16, color:'#a00', fontWeight:400, fontSize:15}}>
                        {duplicates.map(dup => (
                          <li key={dup.id}>{dup.name} <span style={{fontWeight:600}}>({dup.count} times)</span></li>
                        ))}
                      </ul>
                      <button style={{marginLeft: 10, padding:'0.3rem 1rem',background:'linear-gradient(90deg, #a00 60%, #d66 100%)',color:'#fff',border:'none',borderRadius:6,fontWeight:'bold',cursor:'pointer',boxShadow:'0 1px 4px #f3e6fa'}} onClick={fixDuplicates} disabled={fixing}>{fixing ? 'Fixing...' : 'Fix'}</button>
                    </div>
                  )}
                  {checked && duplicates.length === 0 && (
                    <div style={{background:'#eafbe7',color:'#1a7f37',padding:'0.7rem 1.2rem',borderRadius:10,fontWeight:'bold',boxShadow:'0 2px 8px #eafbe7'}}>No duplicates</div>
                  )}
                </div>
                {tracksLoading ? <p>Loading tracks...</p> : (
                  <>
                    <ul style={{listStyle:'none', padding:0, maxHeight: '350px', overflowY: 'auto'}}>
                      {pagedTracks.map((item, idx) => (
                        <li key={item.track?.id || idx} style={{marginBottom: 12, padding:8, borderRadius:6, background:'#faf6ff', boxShadow:'0 1px 4px rgba(68,22,68,0.04)'}}>
                          <span style={{fontWeight:500}}>{item.track?.name}</span>
                          <span style={{marginLeft:8, color:'#888'}}>{item.track?.artists?.map(a=>a.name).join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                    {totalPages > 1 && (
                      <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:12}}>
                        <button onClick={() => setTrackPage(p => Math.max(0, p-1))} disabled={trackPage===0} style={{padding:'0.3rem 1rem',borderRadius:6,border:'none',background:'#eee',color:'#441644',fontWeight:'bold',cursor:trackPage===0?'not-allowed':'pointer'}}>Prev</button>
                        <span style={{alignSelf:'center'}}>Page {trackPage+1} of {totalPages}</span>
                        <button onClick={() => setTrackPage(p => Math.min(totalPages-1, p+1))} disabled={trackPage===totalPages-1} style={{padding:'0.3rem 1rem',borderRadius:6,border:'none',background:'#eee',color:'#441644',fontWeight:'bold',cursor:trackPage===totalPages-1?'not-allowed':'pointer'}}>Next</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div style={{color:'#888', textAlign:'center', marginTop:'4rem'}}>Select a playlist to view its tracks</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;
