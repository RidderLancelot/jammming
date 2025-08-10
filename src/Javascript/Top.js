import React, { useEffect, useState } from 'react';
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
    <div className="top-container">
      <div className="top-controls">
        <h1 style={{color:'rgb(68,22,68)', margin: 0}}>Your Top 50</h1>
        <div className="top-actions">
          {/* Category selector (desktop: native select) */}
          <div className="only-desktop">
            <label className="control">
              <span className="control-label">Category</span>
              <select
                className="control-select"
                value={category}
                onChange={e=>setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Category selector (mobile: segmented control) */}
          <div className="only-mobile">
            <div className="control">
              <span className="control-label">Category</span>
              <div className="segmented" role="tablist" aria-label="Top category">
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    className={opt.value === category ? 'seg-btn active' : 'seg-btn'}
                    aria-selected={opt.value === category}
                    aria-pressed={opt.value === category}
                    onClick={() => setCategory(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time range selector (desktop: native select) */}
          <div className="only-desktop">
            <label className="control">
              <span className="control-label">Range</span>
              <select
                className="control-select"
                value={timeRange}
                onChange={e=>setTimeRange(e.target.value)}
              >
                {OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Time range selector (mobile: segmented control) */}
          <div className="only-mobile">
            <div className="control">
              <span className="control-label">Range</span>
              <div className="segmented" role="tablist" aria-label="Time range">
                {OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    className={opt.value === timeRange ? 'seg-btn active' : 'seg-btn'}
                    aria-selected={opt.value === timeRange}
                    aria-pressed={opt.value === timeRange}
                    onClick={() => setTimeRange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p style={{marginTop:0, color:'#777'}}>Pick one: Artists, Songs, or Albums. Spotify ranges: last 4 weeks, last 6 months, all time.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}

      {/* Artists grid */}
      {!loading && !error && category === 'artists' && (
        <section>
          <h2 style={{color:'rgb(68,22,68)'}}>Top Artists</h2>
          <ol className="top-grid">
            {artists.map((a, i) => (
              <li key={a.id} className="top-card">
                <div className="top-rank">{i + 1}</div>
                <img className="top-img round" src={a.images?.[0]?.url} alt={a.name} width={56} height={56} />
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
          <ol className="top-grid">
            {tracks.map((t, i) => (
              <li key={t.id} className="top-card">
                <div className="top-rank">{i + 1}</div>
                <img className="top-img square" src={t.album?.images?.[0]?.url} alt={t.name} width={56} height={56} />
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
          <ol className="top-grid">
            {albums.map((al, i) => (
              <li key={al.id} className="top-card">
                <div className="top-rank">{i + 1}</div>
                <img className="top-img square" src={al.images?.[0]?.url} alt={al.name} width={56} height={56} />
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
