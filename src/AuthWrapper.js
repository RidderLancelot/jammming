import { useEffect, useState } from 'react';
import { getAccessToken } from './Javascript/Spotify';

function AuthWrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return <div>Redirecting to Spotify for authentication...</div>;
  }
  return children;
}

export default AuthWrapper;
