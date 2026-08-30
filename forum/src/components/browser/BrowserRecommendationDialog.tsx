import { useEffect, useState } from 'react';
import { useClientConfig } from '../../hooks/useClientConfig';

const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';
const DISMISSED_STORAGE_KEY = 'capubbs-browser-recommendation-dismissed';
const FALLBACK_BROWSER_DOWNLOAD_URL = 'https://frostember.lanzoup.com/b00oe4ba4j';

export function BrowserRecommendationDialog() {
  const [mobileViewport, setMobileViewport] = useState(false);
  const [open, setOpen] = useState(false);
  const clientConfig = useClientConfig();
  const browserDownloadUrl = clientConfig?.browserDownloadUrl || FALLBACK_BROWSER_DOWNLOAD_URL;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const updateViewport = () => setMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (mobileViewport && !hasDismissedRecommendation()) setOpen(true);
  }, [mobileViewport]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, '1');
    } catch {
      // Storage can be unavailable in private browsing or restricted frames.
    }
  }

  if (!open) return null;

  return (
    <div className="browser-recommendation-layer" role="presentation">
      <section
        aria-labelledby="browser-recommendation-title"
        className="browser-recommendation-dialog"
        role="dialog"
      >
        <p id="browser-recommendation-title">建议使用谷歌或火狐浏览器，以获得更好的体验</p>
        <div className="browser-recommendation-actions">
          <button onClick={dismiss} type="button">不再提示</button>
          <a href={browserDownloadUrl} onClick={dismiss}>前往下载</a>
        </div>
      </section>
    </div>
  );
}

function hasDismissedRecommendation() {
  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
