import { CheckCircle2, ImagePlus, LockKeyhole, Mail, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

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

  return (
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
    </div>
  );
}

export function AvatarDialog({
  avatarSrc,
  onClose,
  onSave,
  open,
}: {
  avatarSrc: string;
  onClose: () => void;
  onSave: (src: string) => void;
  open: boolean;
}) {
  const [preview, setPreview] = useState(avatarSrc);

  useEffect(() => setPreview(avatarSrc), [avatarSrc, open]);

  function readFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <DialogFrame icon={<ImagePlus size={18} />} onClose={onClose} open={open} title="头像预览">
      <div className="profile-dialog-body">
        <img className="profile-avatar-preview" src={preview} alt="当前头像预览" />
        <p className="profile-dialog-copy">选择一张本地图片预览。演示模式只在当前页面会话中保留头像。</p>
        <label className="profile-file-input">
          <ImagePlus size={16} />选择本地图片
          <input accept="image/*" type="file" onChange={(event) => readFile(event.target.files?.[0])} />
        </label>
      </div>
      <DialogFooter onCancel={onClose} onConfirm={() => { onSave(preview); onClose(); }} confirmLabel="使用此头像" />
    </DialogFrame>
  );
}

export function EmailDialog({
  email,
  onClose,
  onSave,
  open,
  visible,
}: {
  email: string;
  onClose: () => void;
  onSave: (email: string, visible: boolean) => void;
  open: boolean;
  visible: boolean;
}) {
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftVisible, setDraftVisible] = useState(visible);

  useEffect(() => {
    setDraftEmail(email);
    setDraftVisible(visible);
  }, [email, open, visible]);

  return (
    <DialogFrame icon={<Mail size={18} />} onClose={onClose} open={open} title="邮箱管理">
      <div className="profile-dialog-body">
        <label className="profile-dialog-field">
          <span>当前邮箱</span>
          <input type="email" value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} />
        </label>
        <div className="profile-verification-line"><CheckCircle2 size={15} />已验证</div>
        <label className="profile-switch-field">
          <input type="checkbox" checked={draftVisible} onChange={(event) => setDraftVisible(event.target.checked)} />
          <span><strong>在个人主页公开邮箱</strong><small>关闭后，访客只能看到“未公开”。</small></span>
        </label>
        <p className="profile-dialog-copy">演示模式不会发送验证码或更新服务器资料。</p>
      </div>
      <DialogFooter
        confirmDisabled={!draftEmail.trim()}
        confirmLabel="保存邮箱设置"
        onCancel={onClose}
        onConfirm={() => { onSave(draftEmail.trim(), draftVisible); onClose(); }}
      />
    </DialogFrame>
  );
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
