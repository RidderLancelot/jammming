import { BrowserRouter as Router, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
import Playlists from './Javascript/Playlists';
import App from './Javascript/App';
import AuthWrapper from './AuthWrapper';
import Top from './Javascript/Top';

function MainRouter() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/home" element={<AppWithNav />} />
          <Route path="/jammming" element={<AppWithNav />} />
          <Route path="/playlists" element={<PlaylistsWithNav />} />
          <Route path="/top" element={<TopWithNav />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

function HeaderBar() {
  return (
    <header className="App-header">
      <div className="header-inner">
        <Link to="/home" className="brand">
          Ja<span className="purple">mmm</span>ing
        </Link>
        <nav className="nav-links">
          <NavLink to="/playlists" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Playlists</NavLink>
          <NavLink to="/top" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Top 50</NavLink>
        </nav>
      </div>
    </header>
  );
}

function AppWithNav() {
  return (
    <>
      <HeaderBar />
      <App />
    </>
  );
}

function PlaylistsWithNav() {
  return (
    <>
      <HeaderBar />
      <Playlists />
    </>
  );
}

function TopWithNav() {
  return (
    <>
      <HeaderBar />
      <Top />
    </>
  );
}

export default MainRouter;
