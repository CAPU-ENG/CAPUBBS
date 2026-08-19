import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  sendProfileEmailCode,
  updateProfileAvatar,
  updateProfileDetails,
  updateProfileEmailVisibility,
  updateProfilePassword,
  updateProfileSignatures,
  verifyProfileEmail,
} from '../api/profile';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { AvatarDialog, EmailDialog, SecurityDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview, type ProfileDraft } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import { useAuth } from '../context/AuthContext';
import type { ProfileDetail } from '../data/profileDemo';
import { useUserCenterProfile } from '../hooks/useProfileData';
import { getPublicProfilePath } from '../utils/userRoutes';

type OpenDialog = 'avatar' | 'email' | 'security' | null;
type PageNotice = { message: string; tone: 'error' | 'success' } | null;

export function UserCenterPage() {
  const { logout, updateViewerAvatar } = useAuth();
  const profileState = useUserCenterProfile();
  const profile = profileState.data;
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(() => window.location.hash === '#account-security' ? 'security' : null);
  const [notice, setNotice] = useState<PageNotice>(null);
  const email = useMemo(
    () => profile?.details.find((detail) => detail.key === 'email')?.value ?? '',
    [profile?.details],
  );

  useEffect(() => {
    if (!profile || isEditing) return;
    setDraft(createDraft(profile.details, profile.intro));
  }, [isEditing, profile]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateDraft(key: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function toggleEdit() {
    if (!profile || isSavingProfile) return;
    if (!isEditing) {
      setDraft(createDraft(profile.details, profile.intro));
      setNotice(null);
      setIsEditing(true);
      return;
    }

    try {
      setIsSavingProfile(true);
      const updatedProfile = await updateProfileDetails(draft);
      profileState.replace(updatedProfile);
      setIsEditing(false);
      setNotice({ message: '资料保存成功', tone: 'success' });
    } catch (error) {
      setNotice({ message: getPageError(error, '资料保存失败'), tone: 'error' });
    } finally {
      setIsSavingProfile(false);
    }
  }

  function cancelEdit() {
    if (!profile || isSavingProfile) return;
    setDraft(createDraft(profile.details, profile.intro));
    setIsEditing(false);
  }

  if (!profile) {
    return (
      <ProfileLoadPage
        error={profileState.error}
        loading={profileState.status === 'loading'}
        onRetry={profileState.reload}
      />
    );
  }

  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell">
        <ProfileOverview
          actionsDisabled={isSavingProfile}
          avatarSrc={profile.avatarSrc}
          draft={draft}
          emailVisible={profile.emailVisible}
          isEditing={isEditing}
          mode="private"
          profile={profile}
          onAvatarClick={() => setOpenDialog('avatar')}
          onCancelEdit={cancelEdit}
          onDraftChange={updateDraft}
          onEditToggle={() => { void toggleEdit(); }}
          onOpenEmail={() => setOpenDialog('email')}
          onOpenSecurity={() => setOpenDialog('security')}
        />

        {notice ? createPortal(
          <div className={`profile-toast ${notice.tone === 'error' ? 'profile-toast-error' : ''}`} role="status">
            {notice.message}
          </div>,
          document.body,
        ) : null}

        <ProfileWorkspace
          allowedTabs={['posts', 'replies', 'activities', 'bookmarks', 'drafts', 'signatures']}
          asideLink={{ href: getPublicProfilePath(profile.id), label: '查看公开个人主页' }}
          initialRecords={profile.records}
          onSaveSignatures={updateProfileSignatures}
          ownerLabel="我"
        />
      </main>

      <AvatarDialog
        avatarSrc={profile.avatarSrc}
        onClose={() => setOpenDialog(null)}
        onSave={async (src) => {
          const updatedProfile = await updateProfileAvatar(src);
          profileState.replace(updatedProfile);
          updateViewerAvatar(updatedProfile.avatarSrc);
          setNotice({ message: '头像修改成功', tone: 'success' });
        }}
        open={openDialog === 'avatar'}
      />
      <EmailDialog
        email={email}
        onClose={() => setOpenDialog(null)}
        onNotify={(message, tone) => setNotice({ message, tone })}
        onSave={async (visible) => {
          await updateProfileEmailVisibility(visible);
          profileState.replace({ ...profile, emailVisible: visible });
        }}
        onSendCode={sendProfileEmailCode}
        onVerify={async (code) => {
          profileState.replace(await verifyProfileEmail(code));
        }}
        open={openDialog === 'email'}
        verified={profile.emailVerified}
        visible={profile.emailVisible}
      />
      <SecurityDialog
        onClose={() => setOpenDialog(null)}
        onNotify={(message, tone) => setNotice({ message, tone })}
        onSave={async (oldPassword, newPassword) => {
          await updateProfilePassword(oldPassword, newPassword);
          try {
            await logout();
          } catch {
            // changepsd rotates the token before logout runs; AuthContext still clears the stale cookie.
          }
        }}
        open={openDialog === 'security'}
      />
    </div>
  );
}

function ProfileLoadPage({
  error,
  loading,
  onRetry,
}: {
  error: string;
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell profile-not-found-wrap">
        <section className="profile-not-found" role={loading ? 'status' : 'alert'}>
          {loading ? <LoaderCircle className="profile-loading-icon" size={34} /> : null}
          <h1>{loading ? '正在加载个人资料' : '个人资料加载失败'}</h1>
          <p>{loading ? '正在连接论坛服务，请稍候。' : error}</p>
          {!loading ? <button type="button" onClick={onRetry}><RefreshCw size={15} />重新加载</button> : null}
        </section>
      </main>
    </div>
  );
}

function createDraft(details: ProfileDetail[], intro: string): ProfileDraft {
  return {
    hobby: details.find((detail) => detail.key === 'hobby')?.value ?? '',
    intro,
    location: details.find((detail) => detail.key === 'location')?.value ?? '',
    qq: details.find((detail) => detail.key === 'qq')?.value ?? '',
  };
}

function emptyDraft(): ProfileDraft {
  return { hobby: '', intro: '', location: '', qq: '' };
}

function getPageError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
