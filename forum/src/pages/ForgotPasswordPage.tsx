import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, KeyRound, Mail, UserRound } from 'lucide-react';
import { resetPasswordByEmail, sendPasswordResetCode } from '../api/auth';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingSpinner as LoaderCircle } from '../components/layout/LoadingSpinner';
import { TopBar } from '../components/layout/TopBar';
import { ADMIN_EMAIL } from '../constants/contact';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAuthPathWithReturnTo, getAuthReturnTo } from '../utils/authRoutes';

const RESET_CODE_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  useDocumentTitle('重设密码 - CAPUBBS');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const returnTo = getAuthReturnTo(window.location.search);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    if (!normalizedUsername || !normalizedEmail) {
      setError('请填写论坛 ID 和注册邮箱。');
      return;
    }

    setSending(true);
    setError('');
    setMessage('');
    try {
      const result = await sendPasswordResetCode(normalizedUsername, normalizedEmail);
      setMessage(result);
      setCooldown(RESET_CODE_COOLDOWN_SECONDS);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : '验证码发送失败，请稍后重试。');
    } finally {
      setSending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();
    if (!normalizedUsername || !normalizedEmail || !normalizedCode) {
      setError('请填写论坛 ID、注册邮箱和验证码。');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await resetPasswordByEmail(normalizedUsername, normalizedEmail, normalizedCode);
      setMessage(result);
      setCode('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '密码重设失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar minimal />

      <main className="auth-page-shell">
        <section className="auth-card" aria-labelledby="forgot-password-title">
          <div className="auth-card-intro">
            <span><KeyRound size={18} /></span>
            <div>
              <h1 id="forgot-password-title">重设密码</h1>
            </div>
          </div>

          <form onSubmit={submit}>
            <label>
              <span>论坛 ID</span>
              <div className="auth-input-wrap">
                <UserRound size={17} />
                <input
                  autoComplete="username"
                  autoFocus
                  name="username"
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  placeholder="输入需要重设密码的论坛 ID"
                  value={username}
                />
              </div>
            </label>

            <label>
              <span>注册邮箱</span>
              <div className="auth-input-wrap">
                <Mail size={17} />
                <input
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  placeholder="输入已验证的北大邮箱"
                  type="email"
                  value={email}
                />
              </div>
            </label>

            <div className="auth-code-row">
              <label>
                <span>邮箱验证码</span>
                <div className="auth-input-wrap">
                  <KeyRound size={17} />
                  <input
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    name="code"
                    onChange={(event) => setCode(event.currentTarget.value)}
                    placeholder="输入验证码"
                    value={code}
                  />
                </div>
              </label>
              <button
                className="auth-code-button"
                disabled={sending || cooldown > 0}
                onClick={() => void sendCode()}
                type="button"
              >
                {sending ? <LoaderCircle className="animate-spin" size={15} /> : null}
                {sending ? '发送中…' : cooldown > 0 ? `${cooldown} 秒` : '发送验证码'}
              </button>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && <p className="auth-success" role="status">{message}</p>}

            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              {submitting ? '重设中…' : '重设密码'}
            </button>

            <p className="auth-help">
              无法通过邮箱重设？联系管理员：<a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
            </p>
          </form>

          <footer className="auth-card-footer">
            <a href={getAuthPathWithReturnTo('/login', returnTo)}>返回登录</a>
          </footer>
        </section>
      </main>
    </div>
  );
}
