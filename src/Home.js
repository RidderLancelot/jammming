import Playlists from './Javascript/Playlists';
import App from './Javascript/App';

function Home() {
  return (
    <div>
      <div style={{marginBottom: 40}}>
        <Playlists />
      </div>
      <hr style={{margin: '40px 0'}} />
      <App />
    </div>
  );
}

export default Home;
