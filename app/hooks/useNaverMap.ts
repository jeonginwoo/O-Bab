// app/hooks/useNaverMap.ts
import { useState, useEffect } from 'react';

const SCRIPT_ID = 'naver-maps-script';

export function useNaverMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const SCRIPT_ID = 'naver-maps-script';

    const handleLoad = () => {
      if (isMounted) {
        setIsLoaded(true);
      }
    };

    const handleError = () => {
      if (isMounted) {
        setError(new Error('Failed to load Naver Maps script.'));
      }
    };

    // If script is already loaded and ready
    if (window.naver && window.naver.maps) {
      setIsLoaded(true);
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NCP_CLIENT_ID}&submodules=geocoder`;
      script.async = true;
      document.head.appendChild(script);
    }
    
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      isMounted = false;
      // The script element might have been removed by another instance on error
      const scriptEl = document.getElementById(SCRIPT_ID);
      if (scriptEl) {
        scriptEl.removeEventListener('load', handleLoad);
        scriptEl.removeEventListener('error', handleError);
      }
    };
  }, []);

  return { isLoaded, error };
}
