import { CheckCircle2, LockKeyhole, Mail, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export { AvatarDialog } from './AvatarEditorDialog';

type DialogFrameProps = {
  children: ReactNode;
  icon: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

function DialogFrame({ children, icon, onClose, open, title }: DialogFrameProps) {
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
        className="profile-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <span>{icon}</span>
          <h2>{title}</h2>
          <button aria-label="关闭" type="button" onClick={onClose}><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export function EmailDialog({
  email,
  onClose,
  onNotify,
  onSave,
  open,
  visible,
}: {
  email: string;
  onClose: () => void;
  onNotify: (message: string, tone: 'error' | 'success') => void;
  onSave: (email: string, visible: boolean) => void;
  open: boolean;
  visible: boolean;
}) {
  const [changeOpen, setChangeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [draftVisible, setDraftVisible] = useState(visible);

  useEffect(() => {
    setChangeOpen(false);
    setCode('');
    setCodeSent(false);
    setNewEmail('');
    setDraftVisible(visible);
  }, [email, open, visible]);

  function sendCode() {
    const normalizedEmail = newEmail.trim();
    if (!isPkuEmail(normalizedEmail)) {
      onNotify('请输入有效的 PKU 邮箱', 'error');
      return;
    }
    if (normalizedEmail.toLowerCase() === email.trim().toLowerCase()) {
      onNotify('新邮箱不能与当前邮箱相同', 'error');
      return;
    }

    setCodeSent(true);
    onNotify('验证码已发送（演示验证码：123456）', 'success');
  }

  function verifyCode() {
    if (!codeSent) {
      onNotify('请先发送验证码', 'error');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      onNotify('请输入 6 位验证码', 'error');
      return;
    }
    if (code.trim() !== '123456') {
      onNotify('验证码错误或已失效', 'error');
      return;
    }

    onSave(newEmail.trim(), draftVisible);
    setChangeOpen(false);
    setCode('');
    setCodeSent(false);
    setNewEmail('');
    onNotify('邮箱验证成功', 'success');
  }

  return (
    <DialogFrame icon={<Mail size={18} />} onClose={onClose} open={open} title="邮箱管理">
      <div className="profile-dialog-body">
        <label className="profile-dialog-field">
          <span>当前邮箱</span>
          <input className="profile-email-locked" type="email" value={email} readOnly aria-readonly="true" />
        </label>
        <div className="profile-email-status-line">
          <div className="profile-verification-line"><CheckCircle2 size={15} />已验证</div>
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
              <button type="button" onClick={sendCode}>{codeSent ? '重新发送' : '发送验证码'}</button>
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
              <button className="profile-email-verify" type="button" onClick={verifyCode}>验证</button>
            </div>
          </section>
        ) : null}
        <label className="profile-switch-field">
          <input type="checkbox" checked={draftVisible} onChange={(event) => setDraftVisible(event.target.checked)} />
          <span><strong>在个人主页公开邮箱</strong><small>关闭后，访客只能看到“未公开”。</small></span>
        </label>
      </div>
      <DialogFooter
        confirmLabel="完成"
        onCancel={onClose}
        onConfirm={() => { onSave(email, draftVisible); onClose(); }}
      />
    </DialogFrame>
  );
}

function isPkuEmail(value: string) {
  return /^\d{10}@(?:(?:.+\.)?pku\.edu\.cn|bjmu\.edu\.cn)$/i.test(value.trim());
}

export function SecurityDialog({ onClose, open }: { onClose: () => void; open: boolean }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const mismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [open]);

  return (
    <DialogFrame icon={<LockKeyhole size={18} />} onClose={onClose} open={open} title="账号安全">
      <div className="profile-dialog-body profile-security-fields">
        <label className="profile-dialog-field"><span>当前密码</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
        <label className="profile-dialog-field"><span>新密码</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
        <label className="profile-dialog-field"><span>确认新密码</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
        {mismatch ? <p className="profile-dialog-error">两次输入的新密码不一致。</p> : null}
        <p className="profile-dialog-copy">演示模式不会提交或保存任何密码。</p>
      </div>
      <DialogFooter
        confirmDisabled={!currentPassword || !newPassword || mismatch}
        confirmLabel="演示修改密码"
        onCancel={onClose}
        onConfirm={onClose}
      />
    </DialogFrame>
  );
}

export function PrivateMessageDialog({
  onClose,
  open,
  recipient,
}: {
  onClose: () => void;
  open: boolean;
  recipient: string;
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage('');
    setSent(false);
  }, [open]);

  return (
    <DialogFrame icon={<MessageCircle size={18} />} onClose={onClose} open={open} title={`私信 ${recipient}`}>
      <div className="profile-dialog-body">
        {sent ? (
          <div className="profile-message-sent"><CheckCircle2 size={28} /><strong>消息已加入演示发送队列</strong><p>尚未连接服务器，不会真正发送。</p></div>
        ) : (
          <label className="profile-dialog-field">
            <span>消息内容</span>
            <textarea maxLength={500} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="写下想说的话……" />
          </label>
        )}
      </div>
      {sent ? (
        <DialogFooter confirmLabel="完成" onCancel={onClose} onConfirm={onClose} hideCancel />
      ) : (
        <DialogFooter confirmDisabled={!message.trim()} confirmIcon={<Send size={14} />} confirmLabel="演示发送" onCancel={onClose} onConfirm={() => setSent(true)} />
      )}
    </DialogFrame>
  );
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
