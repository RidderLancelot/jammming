/*import Track from "./Track";

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQCTzNaUdkvE4vo6uDzanvJ2ZKqu5QTB3nwDgzNich58LJI6udsD3d4iypQZ7d2G0nMokY7Beoc9ha2maHv0Zox276f2Sf9FPKWBU2mRVvKFW98W7sNQJUr9dmLh6Vw6fvpP0hTZwX5mCmu_ygT8kVi7pWrFFOwBKO500aiBpGwowcrWRSBbaFadukh9ran0CqxjKl-hiNieanv5Okrzm9HheERYq2AISZ1eK_A7r847A6URpR9AxTIYwT_8bqox4Qxxix8AGicuubDwJG8Cp-jVKNrepa00RwfYPNCd16g6VaoR1OerlBWK';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
  )).items;
}

const topTracks = await getTopTracks();
function TopTracks() {
  return (
    <div>
      {Track(topTracks[0].name, (topTracks[0].artists.map(artist => artist.name).join(', ')), topTracks[0].album.name)}
    </div>
  )
}


export default TopTracks;*/