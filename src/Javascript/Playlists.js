import { useEffect, useState } from 'react';
import { getAccessToken, getCurrentUserId } from './Spotify';

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
  const [showDupDetails, setShowDupDetails] = useState(false);

  // Pagination state
  const [trackPage, setTrackPage] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const TRACKS_PER_PAGE = 100;

  useEffect(() => {
    async function fetchUserAndPlaylists() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error('No access token');
        const uid = await getCurrentUserId();
        let allPlaylists = [];
        let url = 'https://api.spotify.com/v1/me/playlists?limit=50';
        while (url) {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to load playlists');
          const data = await response.json();
          allPlaylists = allPlaylists.concat(data.items || []);
          url = data.next;
        }
        // Only show playlists owned by the user
        const ownedPlaylists = allPlaylists.filter(p => p.owner && p.owner.id === uid);
        setPlaylists(ownedPlaylists);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndPlaylists();
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
    setShowDupDetails(false);
    setTrackPage(0);
    try {
      const { items, total } = await fetchTracksPage(playlist.id, 0);
      setTracks(items);
      setTotalTracks(total);
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
    const info = {};
    for (const item of allTracks) {
      const t = item.track;
      const id = t?.id;
      if (!id) continue;
      count[id] = (count[id] || 0) + 1;
      if (!info[id]) {
        info[id] = {
          name: t?.name,
          artists: t?.artists?.map(a=>a.name).join(', ') || '',
          imageUrl: t?.album?.images?.[0]?.url || '',
        };
      }
    }
    const dups = Object.entries(count)
      .filter(([_, c]) => c > 1)
      .map(([id, c]) => ({ id, name: info[id]?.name, artists: info[id]?.artists, imageUrl: info[id]?.imageUrl, count: c }))
      .sort((a, b) => (b.count - a.count) || (a.name || '').localeCompare(b.name || ''));
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
        const trackId = item.track?.id;
        if (!trackId) return;
        if (!seen.has(trackId)) seen.set(trackId, []);
        seen.get(trackId).push(idx);
      });
      // For each duplicate, remove all by URI, then re-add one at the first occurrence
      for (const [, positions] of seen.entries()) {
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
                <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:16,margin:'16px 0 24px 0'}}>
                  <button onClick={checkDuplicates} style={{padding:'0.5rem 1.2rem',background:'linear-gradient(90deg, #441644 60%, #a259c6 100%)',color:'#fff',border:'none',borderRadius:6,fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px rgba(68,22,68,0.08)',letterSpacing:1}} disabled={checking}>
                    {checking ? `Checking... ${checkProgress}%` : 'Check Duplicates'}
                  </button>
                  {checking && (
                    <div style={{flexBasis:'100%', height: 6, background:'#f1eafa', borderRadius: 999, overflow:'hidden'}}>
                      <div style={{height:'100%', width: `${checkProgress}%`, background:'#a259c6', transition:'width 0.2s ease'}} />
                    </div>
                  )}

                  {duplicates.length > 0 && (
                    <div style={{flexBasis:'100%', background:'#fff7fb',color:'#6e1a6e',padding:'0.9rem 1.2rem',borderRadius:12,boxShadow:'0 2px 10px rgba(165,89,198,0.15)',border:'1px solid #f3d8f7'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12, flexWrap:'wrap'}}>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <span style={{fontWeight:700}}>Duplicates found:</span>
                          <span style={{display:'inline-block', background:'#6e1a6e', color:'#fff', borderRadius:999, padding:'0.2rem 0.6rem', fontWeight:700}}>{duplicates.length}</span>
                          <span style={{color:'#9b4fb8'}}>Extras: {duplicates.reduce((a,d)=>a + (d.count - 1), 0)}</span>
                        </div>
                        <div style={{display:'flex', gap:10}}>
                          <button onClick={() => setShowDupDetails(s => !s)} style={{padding:'0.35rem 0.9rem',background:'#f3e6fa',color:'#6e1a6e',border:'1px solid #e9d7f2',borderRadius:8,fontWeight:700,cursor:'pointer'}}> {showDupDetails ? 'Hide details' : 'Show details'} </button>
                          <button style={{padding:'0.35rem 1rem',background:'linear-gradient(90deg, #a00 60%, #d66 100%)',color:'#fff',border:'none',borderRadius:8,fontWeight:'bold',cursor:'pointer',boxShadow:'0 1px 6px rgba(221,102,102,0.3)'}} onClick={fixDuplicates} disabled={fixing}>{fixing ? 'Fixing...' : 'Fix all'}</button>
                        </div>
                      </div>

                      {showDupDetails && (
                        <ul style={{listStyle:'none', padding:0, marginTop:12, display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12}}>
                          {duplicates.map(dup => (
                            <li key={dup.id} style={{display:'flex', alignItems:'center', gap:12, padding:'0.6rem', borderRadius:10, background:'#fff', border:'1px solid #f0e1f5'}}>
                              <img src={dup.imageUrl} alt={dup.name} width={44} height={44} style={{borderRadius:6, objectFit:'cover', background:'#eee'}} />
                              <div style={{minWidth:0, flex:1}}>
                                <div style={{fontWeight:600, color:'#441644', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{dup.name}</div>
                                <div style={{color:'#8c6a9b', fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{dup.artists}</div>
                              </div>
                              <div title={`${dup.count} occurrences`} style={{minWidth:34, height:34, borderRadius:999, background:'#6e1a6e', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{dup.count}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {checked && duplicates.length === 0 && (
                    <div style={{background:'#eafbe7',color:'#1a7f37',padding:'0.8rem 1.1rem',borderRadius:12,fontWeight:'bold',boxShadow:'0 2px 8px #eafbe7', border:'1px solid #c9efc4'}}>✅ No duplicates</div>
                  )}
                </div>
                {/* Always show pagination and tracks, even before duplicate check/fix */}
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
