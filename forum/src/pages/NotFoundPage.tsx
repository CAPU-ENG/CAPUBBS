import { ArrowLeft, Home, MapPin, X } from 'lucide-react';
import bicycleIcon from '../assets/bg/bicycle.svg';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { toForumHref } from '../utils/forumBasePath';

export function NotFoundPage() {
  useDocumentTitle('页面不存在');
  const homeHref = toForumHref('/');

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign(homeHref);
  }

  return (
    <div className="not-found-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#not-found-title" contextTitle="骑错路了" />

      <main className="not-found-shell" id="not-found-title">
        <section className="not-found-panel" aria-labelledby="not-found-heading">
          <header className="not-found-panel-header">
            <span className="not-found-status"><span aria-hidden="true" />路线中断</span>
            <span className="not-found-header-code">ERROR 404</span>
          </header>

          <div className="not-found-route" aria-hidden="true">
            <span className="not-found-route-start" />
            <span className="not-found-route-line" />
            <img src={bicycleIcon} alt="" />
            <span className="not-found-route-stop"><X size={18} strokeWidth={2.4} /></span>
          </div>

          <div className="not-found-content">
            <div className="not-found-code" aria-hidden="true">404</div>
            <div className="not-found-copy">
              <h1 id="not-found-heading">骑错路了</h1>
              <div className="not-found-path" title={window.location.pathname}>
                <MapPin aria-hidden="true" size={16} />
                <code>{window.location.pathname}</code>
              </div>
              <div className="not-found-actions">
                <a className="not-found-home-link" href={homeHref}>
                  <Home aria-hidden="true" size={17} />
                  返回论坛首页
                </a>
                <button type="button" onClick={goBack}>
                  <ArrowLeft aria-hidden="true" size={17} />
                  返回上一页
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
