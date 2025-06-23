// Spotify.js
// Handles Spotify API authentication and search for tracks

const clientId = 'de8c5edcc39e4f3da974e2e22fe51915';
const redirectUri = window.location.origin; // Redirects back to your app
const scopes = 'playlist-modify-private playlist-modify-public user-read-private user-read-email playlist-read-private playlist-read-collaborative';

let accessToken = '';

export function getAccessToken() {
  if (accessToken) return accessToken;
  // Check if token is in URL
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    if (accessToken) {
      // Remove token from URL
      window.setTimeout(() => (accessToken = ''), Number(expiresIn) * 1000);
      window.history.pushState({}, document.title, window.location.pathname);
      return accessToken;
    }
  }
  // Redirect to Spotify auth
  const authUrl =
    `https://accounts.spotify.com/authorize?client_id=${clientId}` +
    `&response_type=token&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location = authUrl;
}

export async function searchTracks(query) {
  const token = getAccessToken();
  if (!token) return [];
  const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!data.tracks || !data.tracks.items) return [];
  return data.tracks.items.map(track => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    album: track.album.name,
  }));
}

export async function getCurrentUserId() {
  const token = getAccessToken();
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.id;
}

export async function createPlaylist(userId, name) {
  const token = getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, public: false }),
  });
  const data = await response.json();
  return data.id;
}

export async function addTracksToPlaylist(playlistId, uris) {
  const token = getAccessToken();
  // Add tracks in batches of 100
  for (let i = 0; i < uris.length; i += 100) {
    const batch = uris.slice(i, i + 100);
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    });
  }
}

export async function savePlaylistToSpotify(playlistName, uris) {
  if (!playlistName || !Array.isArray(uris) || uris.length === 0) {
    throw new Error('Playlist name and tracks are required');
  }
  if (uris.length > 1000) {
    throw new Error('Spotify playlists are limited to 1000 tracks via API. Please reduce your playlist size.');
  }
  const userId = await getCurrentUserId();
  const playlistId = await createPlaylist(userId, playlistName);
  await addTracksToPlaylist(playlistId, uris);
  return playlistId;
}
