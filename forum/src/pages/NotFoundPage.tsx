import { ArrowLeft, Home } from 'lucide-react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { toForumHref } from '../utils/forumBasePath';

export function NotFoundPage() {
  useDocumentTitle('页面不存在');

  return (
    <div className="not-found-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#not-found-title" contextTitle="页面不存在" />

      <main className="not-found-shell" id="not-found-title">
        <section className="not-found-panel" aria-labelledby="not-found-heading">
          <div className="not-found-code" aria-hidden="true">404</div>
          <h1 id="not-found-heading">页面不存在</h1>
          <div className="not-found-actions">
            <button type="button" onClick={() => window.history.back()}>
              <ArrowLeft aria-hidden="true" size={17} />
              返回上一页
            </button>
            <a className="not-found-home-link" href={toForumHref('/')}>
              <Home aria-hidden="true" size={17} />
              返回首页
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
