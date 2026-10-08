import { useEffect, useState, type FormEvent } from 'react';
import { Check, LockKeyhole, LogIn, UserPlus, UserRound, X } from 'lucide-react';
import { Button } from '../Button';
import { PasswordVisibilityButton } from '../PasswordVisibilityButton';
import { DialogLayer, DialogPresence } from './DialogPresence';
import { LoadingSpinner as LoaderCircle } from './LoadingSpinner';
import defaultAvatar from '../../assets/avatar/default-avatar.svg';
import { readSessionToken } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { md5LegacyStringHex } from '../../utils/md5';
import { readSavedAccounts, removeSavedAccount, saveAccount, type SavedAccount } from '../../utils/savedAccounts';

export function AccountSwitchDialog({ onClose, open }: { onClose: () => void; open: boolean }) {
  return (
    <DialogPresence>{open && <AccountSwitchPanel onClose={onClose} />}</DialogPresence>
  );
}

function AccountSwitchPanel({ onClose }: { onClose: () => void }) {
  const { login, switchAccount, viewer } = useAuth();
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [pendingUsername, setPendingUsername] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const busy = Boolean(pendingUsername);

  useEffect(() => {
    const token = readSessionToken();
    if (viewer && token) saveAccount({ avatar: viewer.avatar, token, username: viewer.username });
    setAccounts(readSavedAccounts());
    // Record the signed-in account once per opening; later avatar refreshes need no rewrite.
  }, []);

  async function switchTo(account: SavedAccount) {
    if (busy || account.username === viewer?.username) return;
    setPendingUsername(account.username);
    setError('');
    try {
      const sessionViewer = await switchAccount(account.token);
      if (sessionViewer) {
        saveAccount({ ...account, avatar: sessionViewer.avatar });
        window.location.reload();
        return;
      }
      setUsername(account.username);
      setPassword('');
      setFormOpen(true);
      setError('登录已失效，请重新输入密码。');
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : '切换失败，请稍后重试。');
    }
    setPendingUsername('');
  }

  function remove(account: SavedAccount) {
    removeSavedAccount(account.username);
    setAccounts(readSavedAccounts());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = username.trim();
    if (busy) return;
    if (!name || !password) {
      setError('请输入 ID 和密码。');
      return;
    }
    setPendingUsername(name);
    setError('');
    try {
      const sessionViewer = await login(name, md5LegacyStringHex(password));
      saveAccount({ avatar: sessionViewer.avatar, token: readSessionToken(), username: sessionViewer.username });
      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请稍后重试。');
      setPendingUsername('');
    }
  }

  return (
    <DialogLayer className="management-dialog-backdrop" onDismiss={busy ? undefined : onClose} role="presentation">
      <section aria-labelledby="account-switch-title" aria-modal="true" className="management-dialog account-switch-dialog" role="dialog">
        <header>
          <h2 id="account-switch-title">切换账号</h2>
          <Button aria-label="关闭" disabled={busy} icon onClick={onClose}><X size={16} /></Button>
        </header>

        <ul className="account-switch-list">
          {accounts.map((account) => {
            const current = account.username === viewer?.username;
            return (
              <li key={account.username}>
                <button
                  aria-current={current || undefined}
                  className="account-switch-item"
                  disabled={busy && !current}
                  onClick={() => void switchTo(account)}
                  type="button"
                >
                  <img
                    alt=""
                    onError={(event) => {
                      if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
                    }}
                    src={account.avatar || defaultAvatar}
                  />
                  <span>{account.username}</span>
                  {current && <Check aria-label="当前账号" size={16} />}
                  {pendingUsername === account.username && <LoaderCircle className="animate-spin" size={16} />}
                </button>
                {!current && (
                  <Button aria-label={`移除${account.username}`} disabled={busy} hoverDanger icon onClick={() => remove(account)}>
                    <X size={15} />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>

        {formOpen && (
          <form className="management-dialog-form account-switch-form" id="account-switch-form" onSubmit={submit}>
            <label>
              <span>ID</span>
              <div className="auth-input-wrap">
                <UserRound size={17} />
                <input
                  autoComplete="username"
                  autoFocus={!username}
                  disabled={busy}
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
                  autoFocus={Boolean(username)}
                  disabled={busy}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="输入密码"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                />
                <PasswordVisibilityButton onToggle={() => setPasswordVisible((visible) => !visible)} visible={passwordVisible} />
              </div>
            </label>
          </form>
        )}
        {error && <p className="auth-error account-switch-error" role="alert">{error}</p>}

        <footer>
          {formOpen ? (
            <>
              <Button disabled={busy} onClick={() => { setFormOpen(false); setError(''); }}>取消</Button>
              <Button disabled={busy} form="account-switch-form" type="submit" variant="primary"><LogIn size={15} />登录</Button>
            </>
          ) : (
            <Button disabled={busy} onClick={() => { setUsername(''); setPassword(''); setError(''); setFormOpen(true); }}>
              <UserPlus size={15} />添加账号
            </Button>
          )}
        </footer>
      </section>
    </DialogLayer>
  );
}
