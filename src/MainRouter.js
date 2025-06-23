import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Playlists from './Javascript/Playlists';
import App from './Javascript/App';
import AuthWrapper from './AuthWrapper';

function MainRouter() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/home" element={<AppWithNav />} />
          <Route path="/jammming" element={<AppWithNav />} />
          <Route path="/playlists" element={<PlaylistsWithNav />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

function AppWithNav() {
  return (
    <>
      <header className="App-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem',background:'rgb(68, 22, 68)',borderBottom:'1px solid #eee',height:'4.0625rem'}}>
        <Link to="/home" style={{margin:0, color:'white', fontSize:'2.5rem', opacity:0.9, textDecoration:'none', fontWeight:'bold'}}>
          Ja<span className="purple">mmm</span>ing
        </Link>
        <nav>
          <Link to="/playlists" style={{textDecoration: 'none', color: '#fff', fontWeight:'bold'}}>Playlists</Link>
        </nav>
      </header>
      <App />
    </>
  );
}

function PlaylistsWithNav() {
  return (
    <>
      <header className="App-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem',background:'rgb(68, 22, 68)',borderBottom:'1px solid #eee',height:'4.0625rem'}}>
        <Link to="/home" style={{margin:0, color:'white', fontSize:'2.5rem', opacity:0.9, textDecoration:'none', fontWeight:'bold'}}>
          Ja<span className="purple">mmm</span>ing
        </Link>
        <nav>
          <Link to="/playlists" style={{textDecoration: 'none', color: '#fff', fontWeight:'bold'}}>Playlists</Link>
        </nav>
      </header>
      <Playlists />
    </>
  );
}

export default MainRouter;
