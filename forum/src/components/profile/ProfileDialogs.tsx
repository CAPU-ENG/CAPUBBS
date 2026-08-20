import { CheckCircle2, LockKeyhole, Mail, MessageCircle, Send, Star, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export { AvatarDialog } from './AvatarEditorDialog';

type DialogFrameProps = {
  children: ReactNode;
  hideCloseButton?: boolean;
  icon: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

function DialogFrame({ children, hideCloseButton = false, icon, onClose, open, title }: DialogFrameProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="profile-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className={`profile-dialog ${hideCloseButton ? 'profile-dialog-no-close' : ''}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <span>{icon}</span>
          <h2>{title}</h2>
          {!hideCloseButton ? <button aria-label="关闭" type="button" onClick={onClose}><X size={18} /></button> : null}
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

const starLevelRules = [
  { rating: 1, range: '0–19' },
  { rating: 2, range: '20–108' },
  { rating: 3, range: '109–316' },
  { rating: 4, range: '317–674' },
  { rating: 5, range: '675–1277' },
  { rating: 6, range: '1278–2302' },
  { rating: 7, range: '2303–3549' },
  { rating: 8, range: '3550–4884' },
  { rating: 9, range: '4885 及以上' },
];

export function StarRulesDialog({
  currentRating,
  onClose,
  open,
}: {
  currentRating: number;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <DialogFrame hideCloseButton icon={<Star size={18} />} onClose={onClose} open={open} title="星级规则">
      <div className="profile-dialog-body profile-star-rules">
        <div className="profile-star-current">
          <span>当前星级</span>
          <strong>{'★'.repeat(currentRating)}<small>{currentRating} 星</small></strong>
        </div>
        <p>星级通常按普通版块的发帖数与回复数之和计算。</p>
        <table>
          <thead>
            <tr><th scope="col">星级</th><th scope="col">发帖数 + 回复数</th></tr>
          </thead>
          <tbody>
            {starLevelRules.map((rule) => (
              <tr className={rule.rating === currentRating ? 'profile-star-rule-current' : undefined} key={rule.rating}>
                <th scope="row">{'★'.repeat(rule.rating)}</th>
                <td>{rule.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="profile-dialog-copy">灌水版内容单独计入灌水数，不参与星级计算。</p>
      </div>
    </DialogFrame>
  );
}

export function EmailDialog({
  email,
  onClose,
  onNotify,
  onSendCode,
  onSave,
  onVerify,
  open,
  verified,
  visible,
}: {
  email: string;
  onClose: () => void;
  onNotify: (message: string, tone: 'error' | 'success') => void;
  onSendCode: (email: string) => Promise<void>;
  onSave: (visible: boolean) => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  open: boolean;
  verified: boolean;
  visible: boolean;
}) {
  const [changeOpen, setChangeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [draftVisible, setDraftVisible] = useState(visible);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setChangeOpen(false);
    setCode('');
    setCodeSent(false);
    setNewEmail('');
    setDraftVisible(visible);
    setIsSending(false);
    setIsSaving(false);
    setIsVerifying(false);
  }, [email, open, visible]);

  async function sendCode() {
    const normalizedEmail = newEmail.trim();
    if (!isPkuEmail(normalizedEmail)) {
      onNotify('请输入有效的 PKU 邮箱（10 位学号）', 'error');
      return;
    }
    if (normalizedEmail.toLowerCase() === email.trim().toLowerCase()) {
      onNotify('新邮箱不能与当前邮箱相同', 'error');
      return;
    }

    try {
      setIsSending(true);
      await onSendCode(normalizedEmail);
      setCodeSent(true);
      onNotify('验证码已发送，请检查邮箱', 'success');
    } catch (error) {
      onNotify(getDialogError(error, '验证码发送失败'), 'error');
    } finally {
      setIsSending(false);
    }
  }

  async function verifyCode() {
    if (!codeSent) {
      onNotify('请先发送验证码', 'error');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      onNotify('请输入 6 位验证码', 'error');
      return;
    }
    try {
      setIsVerifying(true);
      await onVerify(code.trim());
      setChangeOpen(false);
      setCode('');
      setCodeSent(false);
      setNewEmail('');
      onNotify('邮箱验证成功', 'success');
    } catch (error) {
      onNotify(getDialogError(error, '验证码错误或已失效'), 'error');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <DialogFrame icon={<Mail size={18} />} onClose={onClose} open={open} title="邮箱管理">
      <div className="profile-dialog-body">
        <label className="profile-dialog-field">
          <span>当前邮箱</span>
          <input className="profile-email-locked" type="email" value={email} readOnly aria-readonly="true" />
        </label>
        <div className="profile-email-status-line">
          <div className="profile-verification-line"><CheckCircle2 size={15} />{verified ? '已验证' : '未验证'}</div>
          <button type="button" onClick={() => setChangeOpen((current) => !current)}>
            {changeOpen ? '取消更换' : '更换邮箱'}
          </button>
        </div>
        {changeOpen ? (
          <section className="profile-email-change-panel" aria-label="更换邮箱">
            <div className="profile-email-action-row">
              <input
                aria-label="输入 PKU 邮箱"
                autoComplete="email"
                placeholder="输入 PKU 邮箱"
                type="email"
                value={newEmail}
                onChange={(event) => { setNewEmail(event.target.value); setCodeSent(false); }}
              />
              <button disabled={isSending || isVerifying} type="button" onClick={sendCode}>
                {isSending ? '发送中' : codeSent ? '重新发送' : '发送验证码'}
              </button>
            </div>
            <div className="profile-email-action-row">
              <input
                aria-label="6 位验证码"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 位验证码"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button className="profile-email-verify" disabled={isSending || isVerifying} type="button" onClick={verifyCode}>
                {isVerifying ? '验证中' : '验证'}
              </button>
            </div>
          </section>
        ) : null}
        <label className="profile-switch-field">
          <input type="checkbox" checked={draftVisible} onChange={(event) => setDraftVisible(event.target.checked)} />
          <span><strong>在个人主页公开邮箱</strong><small>关闭后，访客只能看到“未公开”。</small></span>
        </label>
      </div>
      <DialogFooter
        confirmDisabled={isSaving || isSending || isVerifying}
        confirmLabel="完成"
        onCancel={onClose}
        onConfirm={async () => {
          try {
            setIsSaving(true);
            await onSave(draftVisible);
            onNotify('邮箱公开设置已更新', 'success');
            onClose();
          } catch (error) {
            onNotify(getDialogError(error, '邮箱设置保存失败'), 'error');
          } finally {
            setIsSaving(false);
          }
        }}
      />
    </DialogFrame>
  );
}

function isPkuEmail(value: string) {
  return /^\d{10}@(?:(?:[a-z0-9-]+\.)*pku\.edu\.cn|bjmu\.edu\.cn)$/i.test(value.trim());
}

export function SecurityDialog({
  onClose,
  onNotify,
  onSave,
  open,
}: {
  onClose: () => void;
  onNotify: (message: string, tone: 'error' | 'success') => void;
  onSave: (oldPassword: string, newPassword: string) => Promise<void>;
  open: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const mismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
  }, [open]);

  return (
    <DialogFrame icon={<LockKeyhole size={18} />} onClose={onClose} open={open} title="账号安全">
      <div className="profile-dialog-body profile-security-fields">
        <label className="profile-dialog-field"><span>当前密码</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
        <label className="profile-dialog-field"><span>新密码</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
        <label className="profile-dialog-field"><span>确认新密码</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
        {mismatch ? <p className="profile-dialog-error">两次输入的新密码不一致。</p> : null}
        <p className="profile-dialog-copy">密码修改成功后，出于安全原因需要重新登录。</p>
      </div>
      <DialogFooter
        confirmDisabled={!currentPassword || !newPassword || mismatch || isSaving}
        confirmLabel={isSaving ? '修改中' : '修改密码'}
        onCancel={onClose}
        onConfirm={async () => {
          try {
            setIsSaving(true);
            await onSave(currentPassword, newPassword);
            onClose();
            onNotify('密码已修改，请重新登录', 'success');
          } catch (error) {
            onNotify(getDialogError(error, '密码修改失败'), 'error');
          } finally {
            setIsSaving(false);
          }
        }}
      />
    </DialogFrame>
  );
}

export function PrivateMessageDialog({
  onClose,
  onSend,
  open,
  recipient,
}: {
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
  open: boolean;
  recipient: string;
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage('');
    setSent(false);
    setError('');
    setIsSending(false);
  }, [open]);

  return (
    <DialogFrame icon={<MessageCircle size={18} />} onClose={onClose} open={open} title={`私信 ${recipient}`}>
      <div className="profile-dialog-body">
        {sent ? (
          <div className="profile-message-sent"><CheckCircle2 size={28} /><strong>私信已发送</strong><p>对方可以在论坛消息中查看。</p></div>
        ) : (
          <label className="profile-dialog-field">
            <span>消息内容</span>
            <textarea maxLength={500} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="写下想说的话……" />
          </label>
        )}
        {error ? <p className="profile-dialog-error">{error}</p> : null}
      </div>
      {sent ? (
        <DialogFooter confirmLabel="完成" onCancel={onClose} onConfirm={onClose} hideCancel />
      ) : (
        <DialogFooter
          confirmDisabled={!message.trim() || isSending}
          confirmIcon={<Send size={14} />}
          confirmLabel={isSending ? '发送中' : '发送'}
          onCancel={onClose}
          onConfirm={async () => {
            try {
              setIsSending(true);
              setError('');
              await onSend(message.trim());
              setSent(true);
            } catch (sendError) {
              setError(getDialogError(sendError, '私信发送失败'));
            } finally {
              setIsSending(false);
            }
          }}
        />
      )}
    </DialogFrame>
  );
}

function getDialogError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function DialogFooter({
  confirmDisabled = false,
  confirmIcon,
  confirmLabel,
  hideCancel = false,
  onCancel,
  onConfirm,
}: {
  confirmDisabled?: boolean;
  confirmIcon?: ReactNode;
  confirmLabel: string;
  hideCancel?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <footer className="profile-dialog-footer">
      {!hideCancel ? <button className="profile-dialog-cancel" type="button" onClick={onCancel}>取消</button> : null}
      <button className="profile-dialog-confirm" disabled={confirmDisabled} type="button" onClick={onConfirm}>{confirmIcon}{confirmLabel}</button>
    </footer>
  );
}
