import type { LayoutSlot, ModuleSize } from "../shell/shell";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

export const spotifyModule = {
  id: "spotify",
  name: "Spotify",
  refreshInterval: 3000, 
  position: "middle-right" as LayoutSlot, 
  size: "small" as ModuleSize,

  async update() {
    try {
      const accessToken = await getAccessToken();

      const currentResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      // NO MUSIC PLAYING (Returns isPlaying: false to hide the widget)
      if (currentResponse.status === 204 || currentResponse.status > 400) {
        return {
          data: {
            isPlaying: false, 
            songName: "",
            artistName: "",
            albumCover: "",
            progress: { currentText: "0:00", totalText: "0:00", percent: 0 },
            playlist: []
          }
        };
      }

      const currentPlaying = await currentResponse.json();

      if (!currentPlaying || !currentPlaying.item) {
         throw new Error("No track item found");
      }

      const songName = currentPlaying.item.name || "Unknown Track";
      const artistName = currentPlaying.item.artists?.map((a: { name: string }) => a.name).join(", ") || "Unknown Artist";
      const albumCover = currentPlaying.item.album?.images?.[0]?.url || "";
      
      const progressMs = currentPlaying.progress_ms || 0;
      const durationMs = currentPlaying.item.duration_ms || 1; 
      const percent = (progressMs / durationMs) * 100;

      const queueResponse = await fetch("https://api.spotify.com/v1/me/player/queue", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      let playlist: string[] = ["No upcoming tracks"];
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        if (queueData && queueData.queue && queueData.queue.length > 0) {
          playlist = queueData.queue.slice(0, 3).map((track: { name: string }) => track.name);
        }
      }

      // MUSIC IS PLAYING (Returns isPlaying: true to show the widget)
      return {
        data: {
          isPlaying: true, 
          songName,
          artistName,
          albumCover,
          progress: { 
            currentText: formatTime(progressMs), 
            totalText: formatTime(durationMs), 
            percent 
          },
          playlist 
        },
      };
    } catch (error) {
      console.error("Failed to fetch from Spotify", error);
      
      // ERROR STATE (Returns isPlaying: false to hide the widget)
      return {
        data: {
          isPlaying: false, 
          songName: "",
          artistName: "",
          albumCover: "",
          progress: { currentText: "0:00", totalText: "0:00", percent: 0 },
          playlist: []
        }
      };
    }
  },
};