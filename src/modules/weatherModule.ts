/* This module uses the free open-meteo api to get weather and temp information of your location */

import type { LayoutSlot, ModuleSize } from "../shell/shell"

export const weatherModule = {
    id: "weather",
    name: "Weather",
    refreshInterval: 300000, //Every 5 minutes, update weather
    position: "top-left" as LayoutSlot,
    size: "small" as ModuleSize,

    async update() {
        const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.7326&longitude=-73.4454&current=temperature_2m,weather_code&timezone=America%2FNew_York&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch"
        );

        const weather = await response.json();

        let weatherCode: string;

        switch (weather.current.weather_code) {
        case 0:
            weatherCode = "Clear skies";
            break;
        case 1:
        case 2:
        case 3:
            weatherCode = "Cloudy";
            break;
        case 45:
        case 48:
            weatherCode = "Foggy";
            break;
        case 51:
        case 53:
        case 55:
            weatherCode = "Drizzle";
            break;
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            weatherCode = "Rain";
            break;
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            weatherCode = "Snow";
            break;
        case 95:
        case 96:
        case 99:
            weatherCode = "Thunderstorms";
            break;
        default:
            weatherCode =  ""; // Handles any numbers that don't match
    }

        return {
            data: {
                temp: Math.round(weather.current.temperature_2m),
                condition: weatherCode,
            },
        };
    },
};










/*

export const weatherModule = {
  id: "weather",
  name: "Weather",

  cache: undefined as any,
  refreshInterval: 5 * 60 * 1000, //5 Minutes
  lastFetch: 0,

  update: async function () {
    const now = Date.now();

    if ( this.cache && now - this.lastFetch < this.refreshInterval ){
        return this.cache;
        }
    
    const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.70&longitude=-73.44&current=temperature_2m,weather_code&timezone=America%2FNew_York&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch"
    );

    const weather = await response.json();

    //console.log("WEATHER RESPONSE: ", weather)

    let weatherCode: string;

    switch (weather.current.weather_code) {
        case 0:
            weatherCode = "Clear skies";
            break;
        case 1:
        case 2:
        case 3:
            weatherCode = "Cloudy";
            break;
        case 45:
        case 48:
            weatherCode = "Foggy";
            break;
        case 51:
        case 53:
        case 55:
            weatherCode = "Drizzle";
            break;
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            weatherCode = "Rain";
            break;
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            weatherCode = "Snow";
            break;
        case 95:
        case 96:
        case 99:
            weatherCode = "Thunderstorms";
            break;
        default:
            weatherCode =  ""; // Handles any numbers that don't match
    }

    this.cache = {
        data: {
            temp: Math.round(weather.current.temperature_2m),
            condition: weatherCode,
        },
        lastUpdated: now,
        displayType: "widget",
        position: "top-right"
    };

    this.lastFetch = now;

    return this.cache;
  },
};

*/