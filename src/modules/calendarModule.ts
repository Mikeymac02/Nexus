/* eslint-disable @typescript-eslint/no-explicit-any */


const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.VITE_GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

// Helper to add 'th', 'st', 'nd', 'rd' to the day number
function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

export const calendarModule = {
  id: "calendar",
  name: "Calendar",
  refreshInterval: 300000, 


  async update() {
    try {
      const accessToken = await getAccessToken();

      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // 1. Generate the nicely formatted date string
      const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
      const month = now.toLocaleDateString("en-US", { month: "long" });
      const day = now.getDate();
      const currentDateString = `${weekday}, ${month} ${getOrdinalNum(day)}`;

      const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
      url.searchParams.append("timeMin", now.toISOString());
      url.searchParams.append("timeMax", endOfDay.toISOString());
      url.searchParams.append("singleEvents", "true"); 
      url.searchParams.append("orderBy", "startTime");
      url.searchParams.append("maxResults", "5");

      const response = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      if (!response.ok) {
         throw new Error("Failed to fetch calendar from Google");
      }

      const data = await response.json();

      // 2. Extract the location along with the title and time
      const events = data.items ? data.items.map((event: any) => {
        const start = event.start.dateTime || event.start.date;
        const dateObj = new Date(start);
        const timeString = event.start.dateTime 
            ? dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) 
            : "All Day";

        return {
          title: event.summary || "Busy",
          time: timeString,
          location: event.location || null // Grab the location data!
        };
      }) : [];

      return {
        data: {
          currentDate: currentDateString, // Pass the date string to the widget
          events: events.length > 0 ? events : [{ title: "No more events today", time: "", location: null }]
        }
      };
    } catch (error) {
      console.error("Calendar fetch error:", error);
      return {
        data: {
          currentDate: "Error",
          events: [{ title: "Error loading schedule", time: "Check network connection", location: null }]
        }
      };
    }
  }
};