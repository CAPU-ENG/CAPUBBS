import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import {
  ArrowRight,
  AtSign,
  Bike,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserPlus,
  UserRound,
} from 'lucide-react';
import defaultAvatar from '../assets/bg/bicycle.svg';
import qqIcon from '../assets/icons/qq.svg';
import { isUsernameAvailable, sendRegisterEmailCode } from '../api/auth';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { AvatarDialog } from '../components/profile/AvatarEditorDialog';
import { ADMIN_EMAIL } from '../constants/contact';
import { useAuth } from '../context/AuthContext';
import { getAuthPathWithReturnTo, getAuthReturnTo, replaceForumLocation } from '../utils/authRoutes';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import { md5LegacyStringHex } from '../utils/md5';

const PKU_EMAIL_PATTERN = /^\d{10}@(?:(?:.+\.)?pku\.edu\.cn|bjmu\.edu\.cn)$/i;
const AVATAR_OPTIONS = [
  ['lotus.jpeg', '莲花'],
  ['yellow daisy.jpeg', '雏菊'],
  ['parrot.jpeg', '鹦鹉'],
  ['red rose.jpeg', '玫瑰'],
  ['guitar.jpeg', '吉他'],
  ['soccer.jpeg', '足球'],
  ['piano.jpeg', '钢琴'],
].map(([filename, label]) => ({
  label,
  src: `/bbsimg/icons/${encodeURIComponent(filename)}`,
}));

type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type Notice = { message: string; tone: 'error' | 'success' } | null;

export function RegisterPage() {
  const { register, status } = useAuth();
  const usernameCheckRequestRef = useRef(0);
  const [username, setUsername] = useState('');
  const [usernameState, setUsernameState] = useState<UsernameState>('idle');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sex, setSex] = useState('0');
  const [icon, setIcon] = useState(AVATAR_OPTIONS[0].src);
  const [customAvatar, setCustomAvatar] = useState<{ icon: string; src: string } | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(() => Date.now());
  const [qq, setQq] = useState('');
  const [place, setPlace] = useState('');
  const [hobby, setHobby] = useState('');
  const [intro, setIntro] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const returnTo = getAuthReturnTo(window.location.search);
  const captchaSrc = `/assets/api/securimage/securimage_show.php?sid=${captchaNonce}`;
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const closeAvatarDialog = useCallback(() => setAvatarDialogOpen(false), []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const frame = window.requestAnimationFrame(() => replaceForumLocation(returnTo));
    return () => window.cancelAnimationFrame(frame);
  }, [returnTo, status]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function checkUsername() {
    const value = username.trim();
    const requestId = ++usernameCheckRequestRef.current;
    if (!value || value.includes("'")) {
      setUsernameState('invalid');
      return;
    }

    setUsernameState('checking');
    try {
      const available = await isUsernameAvailable(value);
      if (requestId !== usernameCheckRequestRef.current || username.trim() !== value) return;
      setUsernameState(available ? 'available' : 'taken');
    } catch {
      if (requestId !== usernameCheckRequestRef.current || username.trim() !== value) return;
      setUsernameState('invalid');
    }
  }

  async function sendEmailCode() {
    const normalizedEmail = email.trim();
    if (!PKU_EMAIL_PATTERN.test(normalizedEmail)) {
      setNotice({ message: '请输入允许的 PKU 学号邮箱。', tone: 'error' });
      return;
    }

    setSendingCode(true);
    setNotice(null);
    try {
      const message = await sendRegisterEmailCode(normalizedEmail);
      setCooldown(60);
      setNotice({ message, tone: 'success' });
    } catch (error) {
      setNotice({ message: getErrorMessage(error, '验证码发送失败，请稍后重试。'), tone: 'error' });
    } finally {
      setSendingCode(false);
    }
  }

  function refreshCaptcha() {
    setCaptcha('');
    setCaptchaNonce(Date.now());
  }

  async function uploadAvatar(avatarSrc: string) {
    if (avatarSrc === defaultAvatar) {
      setCustomAvatar({ icon: '', src: defaultAvatar });
      setIcon('');
      setNotice(null);
      return;
    }

    const avatarResponse = await fetch(avatarSrc);
    if (!avatarResponse.ok) throw new Error('无法读取裁切后的头像。');
    const avatarBlob = await avatarResponse.blob();
    const body = new FormData();
    body.set('file', new File([avatarBlob], 'avatar.png', { type: 'image/png' }));
    setNotice(null);

    const response = await fetch('/bbs/utils/icon_upload.php', {
      body,
      credentials: 'include',
      method: 'POST',
    });
    const result: unknown = await response.json();
    if (!response.ok || !isAvatarUploadResult(result) || result.code !== 0 || !result.url?.trim()) {
      throw new Error(isAvatarUploadResult(result) && result.msg ? result.msg : '头像上传失败，请重试。');
    }

    const uploadedIcon = result.url.trim();
    setCustomAvatar({ icon: uploadedIcon, src: getUploadedAvatarSrc(uploadedIcon) });
    setIcon(uploadedIcon);
    setNotice({ message: '头像上传成功。', tone: 'success' });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const normalizedCode = emailCode.trim();
    const normalizedCaptcha = captcha.trim();

    const validationMessage = validateRegistration({
      captcha: normalizedCaptcha,
      confirmPassword,
      email: normalizedEmail,
      emailCode: normalizedCode,
      password,
      username: normalizedUsername,
      usernameState,
    });
    if (validationMessage) {
      setNotice({ message: validationMessage, tone: 'error' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      await register({
        captcha: normalizedCaptcha,
        email: normalizedEmail,
        emailCode: normalizedCode,
        hobby: hobby.trim(),
        icon,
        intro: intro.trim(),
        passwordHash: md5LegacyStringHex(password),
        place: place.trim(),
        qq: qq.trim(),
        sex,
        username: normalizedUsername,
      });
      setNotice({ message: '注册成功，正在进入论坛。', tone: 'success' });
      replaceForumLocation(returnTo);
    } catch (error) {
      setNotice({ message: getErrorMessage(error, '注册失败，请刷新验证码后重试。'), tone: 'error' });
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar minimal />

      <main className="register-page-shell">
        <section className="register-card" aria-labelledby="register-title">
          <header className="register-card-header">
            <div className="register-card-heading">
              <span className="register-card-icon"><Bike size={19} /></span>
              <h1 id="register-title">欢迎加入 CAPU</h1>
            </div>
          </header>

          <form className="register-form" onSubmit={submit}>
            <div className="register-form-grid">
              <section className="register-form-section" aria-labelledby="account-section-title">
                <div className="register-section-title">
                  <span>01</span>
                  <div>
                    <h2 id="account-section-title">账号信息</h2>
                  </div>
                </div>

                <label className="register-field">
                  <span>ID</span>
                  <div className="register-input-wrap">
                    <UserRound size={17} />
                    <input
                      autoComplete="username"
                      autoFocus
                      maxLength={30}
                      name="username"
                      onBlur={() => void checkUsername()}
                      onChange={(event) => {
                        setUsername(event.currentTarget.value);
                        setUsernameState('idle');
                        usernameCheckRequestRef.current += 1;
                      }}
                      placeholder="一个好的 ID 是美好的开始"
                      value={username}
                    />
                    <UsernameIndicator state={usernameState} />
                  </div>
                  <small>
                    {getUsernameHint(usernameState)}
                    {' · '}
                    <a href="/?bid=2&tid=6205" target="_blank" rel="noreferrer">如何取一个好的 ID？</a>
                  </small>
                </label>

                <div className="register-field">
                  <label htmlFor="register-email">邮箱</label>
                  <div className="register-input-wrap">
                    <AtSign size={17} />
                    <input
                      aria-describedby="register-email-domains"
                      autoComplete="email"
                      id="register-email"
                      maxLength={64}
                      name="email"
                      onChange={(event) => {
                        setEmail(event.currentTarget.value);
                        setEmailCode('');
                      }}
                      placeholder="PKU学号邮箱"
                      type="email"
                      value={email}
                    />
                    <span className="register-email-help" tabIndex={0} aria-describedby="register-email-domains">
                      <CircleHelp aria-label="查看允许的 PKU 邮箱" size={16} />
                      <span id="register-email-domains" role="tooltip">允许的邮箱：@*.pku.edu.cn、@bjmu.edu.cn</span>
                    </span>
                  </div>
                  <small>如遇问题，请联系管理员邮箱：<a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a></small>
                </div>

                <div className="register-field">
                  <span>邮箱验证码</span>
                  <div className="register-inline-field">
                    <div className="register-input-wrap">
                      <ShieldCheck size={17} />
                      <input
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        name="emailCode"
                        onChange={(event) => setEmailCode(event.currentTarget.value.replace(/\D/g, ''))}
                        placeholder="6 位数字"
                        value={emailCode}
                      />
                    </div>
                    <button
                      className="register-secondary-button"
                      disabled={sendingCode || cooldown > 0}
                      onClick={() => void sendEmailCode()}
                      type="button"
                    >
                      {sendingCode && <LoaderCircle className="animate-spin" size={15} />}
                      {cooldown > 0 ? `${cooldown}s 后重发` : sendingCode ? '发送中' : '发送验证码'}
                    </button>
                  </div>
                </div>

                <label className="register-field">
                  <span>密码</span>
                  <div className="register-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      autoComplete="new-password"
                      maxLength={18}
                      minLength={6}
                      name="password"
                      onChange={(event) => setPassword(event.currentTarget.value)}
                      placeholder="6–18 位密码"
                      type="password"
                      value={password}
                    />
                  </div>
                  <div className="register-password-meter" data-strength={passwordStrength.level}>
                    <span /><span /><span />
                    <small>{passwordStrength.label}</small>
                  </div>
                </label>

                <label className="register-field">
                  <span>确认密码</span>
                  <div className="register-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      autoComplete="new-password"
                      maxLength={18}
                      name="confirmPassword"
                      onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                      placeholder="再次输入密码"
                      type="password"
                      value={confirmPassword}
                    />
                    {confirmPassword && password === confirmPassword && <Check className="register-valid-icon" size={16} />}
                  </div>
                </label>
              </section>

              <section className="register-form-section register-identity-section" aria-labelledby="identity-section-title">
                <div className="register-section-title">
                  <span>02</span>
                  <div>
                    <h2 id="identity-section-title">论坛形象</h2>
                  </div>
                </div>

                <div className="register-field">
                  <span>性别</span>
                  <div className="register-segmented" role="group" aria-label="性别">
                    {[
                      ['0', '不公开'],
                      ['1', '男'],
                      ['2', '女'],
                    ].map(([value, label]) => (
                      <button
                        aria-pressed={sex === value}
                        className={sex === value ? 'active' : ''}
                        key={value}
                        onClick={() => setSex(value)}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <fieldset className="register-field">
                  <legend>选择头像</legend>
                  <div className="register-avatar-grid">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        aria-label={`选择${avatar.label}头像`}
                        aria-pressed={icon === avatar.src}
                        className={icon === avatar.src ? 'active' : ''}
                        key={avatar.src}
                        onClick={() => setIcon(avatar.src)}
                        type="button"
                      >
                        <img
                          alt=""
                          onError={(event) => {
                            if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
                          }}
                          src={avatar.src}
                        />
                        {icon === avatar.src && <span><Check size={12} /></span>}
                      </button>
                    ))}
                    <button
                      aria-label="上传自定义头像"
                      aria-pressed={customAvatar?.icon === icon}
                      className={`register-avatar-upload${customAvatar?.icon === icon ? ' active' : ''}`}
                      onClick={() => setAvatarDialogOpen(true)}
                      type="button"
                    >
                      {customAvatar ? (
                        <img alt="自定义头像" src={customAvatar.src} />
                      ) : (
                        <Upload size={18} />
                      )}
                      {customAvatar?.icon === icon && <span><Check size={12} /></span>}
                    </button>
                  </div>
                </fieldset>

                <div className="register-field">
                  <span>图片验证码</span>
                  <div className="register-captcha-row">
                    <div className="register-input-wrap">
                      <ShieldCheck size={17} />
                      <input
                        autoComplete="off"
                        name="captcha"
                        onChange={(event) => setCaptcha(event.currentTarget.value)}
                        placeholder="输入图中算式答案"
                        value={captcha}
                      />
                    </div>
                    <button aria-label="刷新图片验证码" className="register-captcha-image" onClick={refreshCaptcha} type="button">
                      <img alt="图片验证码" src={captchaSrc} />
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <small>看不清时点击图片刷新。</small>
                </div>

                <details className="register-more-fields">
                  <summary><ChevronDown size={16} />补充个人资料 <span>选填</span></summary>
                  <div className="register-more-fields-grid">
                    <label className="register-field">
                      <span>QQ</span>
                      <div className="register-input-wrap">
                        <span
                          aria-hidden="true"
                          className="register-qq-icon"
                          style={{ '--register-qq-icon': `url(${qqIcon})` } as CSSProperties}
                        />
                        <input inputMode="numeric" name="qq" onChange={(event) => setQq(event.currentTarget.value)} value={qq} />
                      </div>
                    </label>
                    <label className="register-field">
                      <span>来自</span>
                      <div className="register-input-wrap">
                        <MapPin size={16} />
                        <input name="place" onChange={(event) => setPlace(event.currentTarget.value)} placeholder="城市或院系" value={place} />
                      </div>
                    </label>
                    <label className="register-field register-more-wide">
                      <span>爱好</span>
                      <div className="register-input-wrap">
                        <Heart size={16} />
                        <input name="hobby" onChange={(event) => setHobby(event.currentTarget.value)} placeholder="用逗号分隔" value={hobby} />
                      </div>
                    </label>
                    <label className="register-field register-more-wide">
                      <span>个人简介</span>
                      <textarea
                        maxLength={500}
                        name="intro"
                        onChange={(event) => setIntro(event.currentTarget.value)}
                        placeholder="向论坛里的朋友介绍一下自己"
                        rows={3}
                        value={intro}
                      />
                    </label>
                  </div>
                </details>
              </section>
            </div>

            {notice && <p className={`register-notice register-notice-${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.message}</p>}

            <footer className="register-form-footer">
              <p>已有账号？<a href={getAuthPathWithReturnTo('/login', returnTo)}>直接登录</a></p>
              <button className="register-submit" disabled={submitting || status === 'loading'} type="submit">
                {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <UserPlus size={16} />}
                {submitting ? '正在注册…' : '创建账号'}
                {!submitting && <ArrowRight size={15} />}
              </button>
            </footer>
          </form>
        </section>
      </main>
      <AvatarDialog
        avatarSrc={customAvatar?.src ?? ''}
        onClose={closeAvatarDialog}
        onSave={uploadAvatar}
        open={avatarDialogOpen}
        showDefaultOption={false}
      />
    </div>
  );
}

function UsernameIndicator({ state }: { state: UsernameState }) {
  if (state === 'checking') return <LoaderCircle aria-label="正在检查 ID" className="animate-spin" size={16} />;
  if (state === 'available') return <Check aria-label="ID 可用" className="register-valid-icon" size={16} />;
  return null;
}

function getUsernameHint(state: UsernameState) {
  if (state === 'checking') return '正在检查这个 ID…';
  if (state === 'available') return '这个 ID 可以使用';
  if (state === 'taken') return '这个 ID 已被注册';
  if (state === 'invalid') return 'ID 不能为空或包含英文单引号';
  return 'ID 将成为你在论坛中的名字';
}

function getPasswordStrength(password: string) {
  if (!password) return { label: '至少 6 位', level: 0 };
  let score = password.length >= 6 ? 1 : 0;
  if (password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return { label: ['至少 6 位', '可用', '较强', '很强'][score], level: score };
}

function validateRegistration(values: {
  captcha: string;
  confirmPassword: string;
  email: string;
  emailCode: string;
  password: string;
  username: string;
  usernameState: UsernameState;
}) {
  if (!values.username || values.username.includes("'")) return '请填写有效的论坛 ID。';
  if (values.usernameState === 'taken') return '这个 ID 已被注册，请换一个。';
  if (!PKU_EMAIL_PATTERN.test(values.email)) return '请输入允许的 PKU 学号邮箱。';
  if (!/^\d{6}$/.test(values.emailCode)) return '邮箱验证码应为 6 位数字。';
  if (values.password.length < 6 || values.password.length > 18) return '密码长度应为 6–18 位。';
  if (values.password !== values.confirmPassword) return '两次输入的密码不一致。';
  if (!values.captcha) return '请输入图中算式答案。';
  return '';
}

function isAvatarUploadResult(value: unknown): value is { code: number; msg?: string; url?: string } {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return typeof result.code === 'number'
    && (result.url === undefined || typeof result.url === 'string')
    && (result.msg === undefined || typeof result.msg === 'string');
}

function getUploadedAvatarSrc(icon: string) {
  return normalizeLegacyAvatar(icon);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
