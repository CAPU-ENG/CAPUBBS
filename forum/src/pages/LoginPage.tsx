import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Bike, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { getAuthReturnTo, replaceForumLocation } from '../utils/authRoutes';
import { md5LegacyStringHex } from '../utils/md5';

export function LoginPage() {
  const { login, status } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const returnTo = getAuthReturnTo(window.location.search);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const frame = window.requestAnimationFrame(() => replaceForumLocation(returnTo));
    return () => window.cancelAnimationFrame(frame);
  }, [returnTo, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username || !password) {
      setError('请输入 ID 和密码。');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(username, md5LegacyStringHex(password));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '登录失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="auth-page-shell">
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-card-intro">
            <span><Bike size={18} /></span>
            <div>
              <h1 id="login-title">登录车协论坛</h1>
              <p>登录后可访问个人中心、消息以及需要身份验证的版块。</p>
            </div>
          </div>

          <form onSubmit={submit}>
            <label>
              <span>ID</span>
              <div className="auth-input-wrap">
                <UserRound size={17} />
                <input
                  autoComplete="username"
                  autoFocus
                  name="username"
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  placeholder="输入论坛 ID"
                  value={username}
                />
              </div>
            </label>

            <label>
              <span>密码</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={17} />
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="输入密码"
                  type="password"
                  value={password}
                />
              </div>
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="auth-submit" disabled={submitting || status === 'loading'} type="submit">
              {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              {submitting ? '登录中…' : '登录'}
            </button>
          </form>

          <footer className="auth-card-footer">
            <span>还没有账号？</span>
            <a href="/bbs/register/">前往注册</a>
          </footer>
        </section>
      </main>
    </div>
  );
}
