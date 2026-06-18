import { useState, useEffect } from 'react';

export interface WeatherData {
  condition: 'clear' | 'cloudy' | 'rain' | 'thunder';
  temperature: number;
  isDay: boolean;
  locationName: string;
}

const LOCATION_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  colombo: { lat: 6.9271, lon: 79.8612, name: 'Colombo' },
  galle: { lat: 6.0535, lon: 80.2117, name: 'Galle' },
  yala: { lat: 6.3698, lon: 81.5222, name: 'Yala' },
  mirissa: { lat: 5.9482, lon: 80.4573, name: 'Mirissa' },
  kandy: { lat: 7.2906, lon: 80.6337, name: 'Kandy' },
  ella: { lat: 6.8722, lon: 81.0454, name: 'Ella' },
  sigiriya: { lat: 7.9570, lon: 80.7603, name: 'Sigiriya' },
  nuwaraeliya: { lat: 6.9497, lon: 80.7891, name: 'Nuwara Eliya' },
  hikkaduwa: { lat: 6.1398, lon: 80.1017, name: 'Hikkaduwa' },
  negombo: { lat: 7.2089, lon: 79.8358, name: 'Negombo' },
  trincomalee: { lat: 8.5874, lon: 81.2152, name: 'Trincomalee' },
  srilanka: { lat: 7.8731, lon: 80.7718, name: 'Sri Lanka' },
};

function resolveCoordinates(location: string) {
  const clean = location.toLowerCase().replace(/[^a-z]/g, '');
  if (LOCATION_COORDINATES[clean]) {
    return LOCATION_COORDINATES[clean];
  }
  // Try substring matching
  for (const key of Object.keys(LOCATION_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return LOCATION_COORDINATES[key];
    }
  }
  return LOCATION_COORDINATES.srilanka;
}

export function useWeather(location: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchWeatherForCoords = async (lat: number, lon: number, name: string) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch weather data');
        const data = await res.json();
        
        if (!isMounted) return;

        const cw = data.current_weather;
        const code = cw.weathercode;
        const isDay = cw.is_day === 1;

        let condition: 'clear' | 'cloudy' | 'rain' | 'thunder' = 'clear';
        if (code === 0 || code === 1) {
          condition = 'clear';
        } else if (code === 2 || code === 3 || code === 45 || code === 48) {
          condition = 'cloudy';
        } else if (code >= 51 && code <= 67) {
          condition = 'rain'; 
        } else if (code >= 80 && code <= 82) {
          condition = 'rain'; 
        } else if (code >= 95 && code <= 99) {
          condition = 'thunder'; 
        } else {
          condition = 'cloudy'; 
        }

        setWeather({
          condition,
          temperature: Math.round(cw.temperature),
          isDay,
          locationName: name,
        });
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Weather fetch error:', err);
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (location) {
      const { lat, lon, name } = resolveCoordinates(location);
      fetchWeatherForCoords(lat, lon, name);
    } else {
      const locationAllowed = localStorage.getItem('eden-location-allowed') !== 'false';
      // Use Geolocation if location is not explicitly searched and allowed
      if (locationAllowed && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherForCoords(position.coords.latitude, position.coords.longitude, 'Your Location');
          },
          (err) => {
            console.warn('Geolocation denied or failed, cycling randomly:', err);
            // Fallback: Randomly cycle through existing locations every 10 seconds
            const keys = Object.keys(LOCATION_COORDINATES);
            const cycleWeather = () => {
              if (!isMounted) return;
              const randomKey = keys[Math.floor(Math.random() * keys.length)];
              const randomLoc = LOCATION_COORDINATES[randomKey];
              fetchWeatherForCoords(randomLoc.lat, randomLoc.lon, randomLoc.name);
            };
            cycleWeather();
            const interval = setInterval(cycleWeather, 10000);
            return () => clearInterval(interval);
          }
        );
      } else {
        // Fallback for no geolocation support or location disallowed
        const defaultLoc = LOCATION_COORDINATES.colombo;
        fetchWeatherForCoords(defaultLoc.lat, defaultLoc.lon, defaultLoc.name);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [location]);

  return { weather, loading, error };
}
