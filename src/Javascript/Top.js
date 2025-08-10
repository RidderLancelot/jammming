import React, { useEffect, useState, useMemo } from 'react';
import { getTopArtists, getTopTracks, getTopAlbums } from './Spotify';

const OPTIONS = [
  { label: 'Last 4 weeks', value: 'short_term' },
  { label: 'Last 6 months', value: 'medium_term' },
  { label: 'All time', value: 'long_term' },
];

const CATEGORY_OPTIONS = [
  { label: 'Artists', value: 'artists' },
  { label: 'Songs', value: 'tracks' },
  { label: 'Albums', value: 'albums' },
];

export default function Top() {
  const [category, setCategory] = useState('artists');
  const [timeRange, setTimeRange] = useState('long_term');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const LIMIT = 50;

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
  }), []);

  const cardStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0.75rem',
    borderRadius: 12,
    background: '#faf7ff',
    border: '1px solid #eee',
    boxShadow: '0 1px 8px rgba(68,22,68,0.06)'
  }), []);

  const numStyle = useMemo(() => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgb(68, 22, 68)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    flex: '0 0 auto'
  }), []);

  const imgRound = { borderRadius: '50%', objectFit: 'cover', background: '#eee' };
  const imgSquare = { borderRadius: 8, objectFit: 'cover', background: '#eee' };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        if (category === 'artists') {
          const a = await getTopArtists(LIMIT, timeRange);
          if (!isMounted) return;
          setArtists(a);
          setTracks([]);
          setAlbums([]);
        } else if (category === 'tracks') {
          const t = await getTopTracks(LIMIT, timeRange);
          if (!isMounted) return;
          setTracks(t);
          setArtists([]);
          setAlbums([]);
        } else {
          const al = await getTopAlbums(LIMIT, timeRange);
          if (!isMounted) return;
          setAlbums(al);
          setArtists([]);
          setTracks([]);
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load top items');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [timeRange, category]);

  return (
    <div style={{maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(68,22,68,0.12)', padding: '1.5rem'}}>
      <div style={{display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap: 12, marginBottom: '0.5rem'}}>
        <h1 style={{color:'rgb(68,22,68)', margin: 0}}>Your Top 50</h1>
        <div style={{display:'flex', gap: 12}}>
          <label style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{color:'#666'}}>Category</span>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{padding:'0.4rem 0.6rem', borderRadius:8}}>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{color:'#666'}}>Range</span>
            <select value={timeRange} onChange={e=>setTimeRange(e.target.value)} style={{padding:'0.4rem 0.6rem', borderRadius:8}}>
              {OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p style={{marginTop:0, color:'#777'}}>Pick one: Artists, Songs, or Albums. Spotify ranges: last 4 weeks, last 6 months, all time.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}

      {/* Artists grid */}
      {!loading && !error && category === 'artists' && (
        <section>
          <h2 style={{color:'rgb(68,22,68)'}}>Top Artists</h2>
          <ol style={{listStyle:'none', padding:0, margin:0, ...gridStyle}}>
            {artists.map((a, i) => (
              <li key={a.id} style={cardStyle}>
                <div style={numStyle}>{i + 1}</div>
                <img src={a.images?.[0]?.url} alt={a.name} width={56} height={56} style={imgRound} />
                <div>
                  <div style={{fontWeight: 600}}>{a.name}</div>
                  <div style={{color:'#888', fontSize: 13}}>{a.genres?.slice(0,2).join(', ')}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tracks grid */}
      {!loading && !error && category === 'tracks' && (
        <section>
          <h2 style={{color:'rgb(68,22,68)'}}>Top Songs</h2>
          <ol style={{listStyle:'none', padding:0, margin:0, ...gridStyle}}>
            {tracks.map((t, i) => (
              <li key={t.id} style={cardStyle}>
                <div style={numStyle}>{i + 1}</div>
                <img src={t.album?.images?.[0]?.url} alt={t.name} width={56} height={56} style={imgSquare} />
                <div>
                  <div style={{fontWeight: 600}}>{t.name}</div>
                  <div style={{color:'#888', fontSize: 13}}>{t.artists?.map(a=>a.name).join(', ')}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Albums grid */}
      {!loading && !error && category === 'albums' && (
        <section>
          <h2 style={{color:'rgb(68,22,68)'}}>Top Albums</h2>
          <ol style={{listStyle:'none', padding:0, margin:0, ...gridStyle}}>
            {albums.map((al, i) => (
              <li key={al.id} style={cardStyle}>
                <div style={numStyle}>{i + 1}</div>
                <img src={al.images?.[0]?.url} alt={al.name} width={56} height={56} style={imgSquare} />
                <div>
                  <div style={{fontWeight: 600}}>{al.name}</div>
                  <div style={{color:'#888', fontSize: 13}}>{al.artists?.map(a=>a.name).join(', ')}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
