import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

export function BrowserRecommendationDialog() {
  const [mobileViewport, setMobileViewport] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const updateViewport = () => setMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (mobileViewport && !isRecommendedBrowser()) setOpen(true);
  }, [mobileViewport]);

  if (!open) return null;

  return (
    <div className="browser-recommendation-backdrop" role="presentation">
      <section
        aria-labelledby="browser-recommendation-title"
        aria-modal="true"
        className="browser-recommendation-dialog"
        role="dialog"
      >
        <button
          aria-label="关闭浏览器提示"
          className="browser-recommendation-close"
          onClick={() => setOpen(false)}
          type="button"
        >
          <X size={18} />
        </button>
        <div className="browser-recommendation-icon" aria-hidden="true">
          <Download size={21} />
        </div>
        <h2 id="browser-recommendation-title">建议使用谷歌或火狐浏览器</h2>
        <p>使用谷歌浏览器或火狐浏览器，获得更好的浏览体验。</p>
        <a
          className="browser-recommendation-download"
          href="/archive-room?folder=%E5%B7%A5%E5%85%B7"
          onClick={() => setOpen(false)}
        >
          <Download size={16} />
          前往下载
        </a>
      </section>
    </div>
  );
}

function isRecommendedBrowser() {
  const userAgent = navigator.userAgent;
  const isFirefox = /Firefox|FxiOS/i.test(userAgent);
  const isChrome = /Chrome|CriOS|Chromium/i.test(userAgent);
  const isOtherChromium = /Edg|EdgiOS|OPR|SamsungBrowser|YaBrowser/i.test(userAgent);
  return isFirefox || (isChrome && !isOtherChromium);
}
