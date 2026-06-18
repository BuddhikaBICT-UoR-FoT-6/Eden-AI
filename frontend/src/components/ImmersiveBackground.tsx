import React, { useState, useEffect } from 'react';

interface ImmersiveBackgroundProps {
  condition: 'clear' | 'cloudy' | 'rain' | 'thunder';
  isDay: boolean;
}

export interface HolidayActive {
  type: 'poya' | 'tamil' | 'muslim' | 'christmas' | 'paradise';
  label: string;
  imageSrc: string;
}

function isPoyaDay(date: Date): boolean {
  const REFERENCE_FULL_MOON = new Date('2025-01-13T00:00:00Z');
  const LUNAR_CYCLE_DAYS = 29.53059;
  const msSinceReference = date.getTime() - REFERENCE_FULL_MOON.getTime();
  const daysSinceReference = msSinceReference / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceReference % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
  return phase <= 1.5 || phase >= (LUNAR_CYCLE_DAYS - 1.5);
}

export function detectActiveHoliday(date: Date): HolidayActive {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. Christmas: Dec 15 to Dec 31
  if (month === 12 && day >= 15) {
    return { type: 'christmas', label: 'Christmas Season', imageSrc: '/christmas_tree.png' };
  }

  // 2. Tamil New Year / Hindu Festivals
  if ((month === 1 && day >= 13 && day <= 16) || (month === 4 && day >= 13 && day <= 15) || (month === 10 && day >= 25 && day <= 31) || (month === 11 && day >= 1 && day <= 5)) {
    return { type: 'tamil', label: 'Hindu Festive Season', imageSrc: '/tamil_kovil.png' };
  }

  // 3. Muslim Holidays
  if ((month === 3 && day >= 18 && day <= 22) || (month === 5 && day >= 25 && day <= 29) || (month === 9 && day >= 1 && day <= 5)) {
    return { type: 'muslim', label: 'Islamic Festive Season', imageSrc: '/muslim_masjid.png' };
  }

  // 4. Poya Day (Full Moon)
  if (isPoyaDay(date)) {
    return { type: 'poya', label: 'Sacred Poya Day', imageSrc: '/poya_moon.png' };
  }

  // 5. Fallback: Sri Lankan Paradise 3D image
  return { type: 'paradise', label: 'Sri Lankan Paradise', imageSrc: '/sri_lanka_paradise.png' };
}

import { DynamicSkyBackground } from './DynamicSkyBackground';

const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({ condition }) => {
  const [holiday, setHoliday] = useState<HolidayActive | null>(null);

  useEffect(() => {
    setHoliday(detectActiveHoliday(new Date()));
  }, []);

  // Get current device hour
  const hour = new Date().getHours();
  let timeOfDay: 'day' | 'dawn' | 'dusk' | 'night' = 'day';
  if (hour >= 19 || hour < 5) {
    timeOfDay = 'night';
  } else if (hour >= 5 && hour < 7) {
    timeOfDay = 'dawn';
  } else if (hour >= 17 && hour < 19) {
    timeOfDay = 'dusk';
  }

  // Determine active photo imageSrc based on holiday type and time of day
  let imageSrc = '/sri_lanka_paradise.png';
  if (holiday) {
    if (holiday.type === 'paradise') {
      if (timeOfDay === 'night') {
        imageSrc = '/sri_lanka_paradise_night.png';
      } else if (timeOfDay === 'dawn') {
        imageSrc = '/sri_lanka_paradise_dawn.png';
      } else if (timeOfDay === 'dusk') {
        imageSrc = '/sri_lanka_paradise_dusk.png';
      } else {
        imageSrc = '/sri_lanka_paradise.png';
      }
    } else {
      imageSrc = holiday.imageSrc;
    }
  }

  // Map our condition to the DynamicSkyBackground weather prop
  let skyWeather: "clear" | "clouds" | "rain" | "thunderstorm" | "drizzle" | "mist" = "clear";
  if (condition === 'cloudy') skyWeather = 'clouds';
  else if (condition === 'thunder') skyWeather = 'thunderstorm';
  else if (condition === 'rain') skyWeather = 'rain';

  return (
    <div className="immersive-bg-container" aria-hidden="true">
      {/* ─── PROCEDURAL SKY BACKGROUND (Bottom Layer) ─── */}
      <DynamicSkyBackground phase={timeOfDay} weather={skyWeather} />

      {/* ─── VIBE PHOTO BACKGROUND (Top Layer, masked to show sky) ─── */}
      <div 
        className="full-screen-vibe-photo" 
        style={{ backgroundImage: `url(${imageSrc})` }} 
      />

      {/* ─── TIME OF DAY TINT OVERLAY (Only applied to the ground image) ─── */}
      <div className={`full-screen-tint-overlay tint-${timeOfDay} ${condition === 'rain' || condition === 'thunder' ? 'tint-raining' : ''}`} />

      <style>{`
        .immersive-bg-container {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -2;
          overflow: hidden;
          background: #020617;
        }

        .full-screen-vibe-photo {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center bottom;
          z-index: 1;
          transition: background-image 0.8s ease-in-out;
          mask-image: linear-gradient(to bottom, transparent 35%, black 60%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 35%, black 60%);
        }

        .full-screen-tint-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          transition: background 0.8s ease-in-out;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, transparent 35%, black 60%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 35%, black 60%);
        }

        /* Tints based on time of day and rain */
        .tint-day {
          background: linear-gradient(to bottom, transparent 0%, rgba(10, 14, 26, 0.4) 100%);
        }
        .tint-dawn {
          background: linear-gradient(to bottom, transparent 0%, rgba(20, 15, 30, 0.5) 70%, rgba(10, 14, 26, 0.7) 100%);
        }
        .tint-dusk {
          background: linear-gradient(to bottom, transparent 0%, rgba(15, 10, 30, 0.55) 70%, rgba(10, 14, 26, 0.75) 100%);
        }
        .tint-night {
          background: linear-gradient(to bottom, transparent 0%, rgba(10, 15, 30, 0.85) 100%);
        }
        .full-screen-tint-overlay.tint-raining {
          background: linear-gradient(to bottom, transparent 0%, rgba(10, 15, 25, 0.85) 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default ImmersiveBackground;
