// app/hooks/useNaverMap.ts
import { useState, useEffect } from 'react';

const SCRIPT_ID = 'naver-maps-script';

export function useNaverMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const SCRIPT_ID = 'naver-maps-script';

    const checkNaverMaps = () => {
      if (window.naver && window.naver.maps && window.naver.maps.Service) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    const handleLoad = () => {
      if (isMounted) {
        if (!checkNaverMaps()) {
          // If loaded but Service not ready, poll briefly
          const intervalId = setInterval(() => {
            if (checkNaverMaps()) {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Clear interval after timeout (e.g., 5 seconds)
          setTimeout(() => clearInterval(intervalId), 5000);
        }
      }
    };

    const handleError = () => {
      if (isMounted) {
        setError(new Error('Failed to load Naver Maps script.'));
      }
    };

    // 1. Check if already loaded and ready
    if (checkNaverMaps()) {
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    
    // 2. If script exists but not ready, poll for it (catches case where script is loading or loaded but Service missing)
    if (script) {
       const intervalId = setInterval(() => {
         if (isMounted && checkNaverMaps()) {
           clearInterval(intervalId);
         }
       }, 100);
       // We don't set a timeout here because if script is loading, it might take time. 
       // But we could add a reasonable timeout or rely on the script listeners below if we re-attach them.
       // However, re-attaching load listener to an already loaded script does nothing.
       // So polling is the robust way for "existing script".
       
       // Cleanup interval if unmount
       return () => {
         clearInterval(intervalId);
         isMounted = false;
       };
    }
    
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
