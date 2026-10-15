import { useCallback, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type GeoStatus = 'idle' | 'locating' | 'error';

function messageFor(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Allow location access in your browser settings, or search for a city instead.';
    case error.POSITION_UNAVAILABLE:
      return 'Your location is unavailable right now. Try again, or search for a city instead.';
    case error.TIMEOUT:
      return 'Finding your location took too long. Please try again.';
    default:
      return 'Could not determine your location.';
  }
}

/** Browser geolocation, requested only when the user asks for it. */
export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const request = useCallback((): Promise<Coordinates | null> => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Your browser does not support location detection. Search for a city instead.');
      return Promise.resolve(null);
    }
    if (!window.isSecureContext) {
      setStatus('error');
      setError('Location is only available on secure (https) pages.');
      return Promise.resolve(null);
    }

    setStatus('locating');
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStatus('idle');
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => {
          setStatus('error');
          setError(messageFor(err));
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  const dismiss = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, request, dismiss };
}
