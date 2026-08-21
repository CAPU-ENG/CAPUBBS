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
import type { ProfileDetail, ProfileRecordMap } from '../data/profileDemo';
import { useUserCenterProfile } from '../hooks/useProfileData';
import {
  readStoredReplyDrafts,
  subscribeStoredReplyDrafts,
  type StoredReplyDraft,
} from '../utils/replyDraftStorage';
import {
  deleteCachedUserAvatar,
  readCachedUserAvatarBlob,
  writeCachedUserAvatarBlob,
} from '../utils/userAvatarCache';
import {
  readStoredThreadComposeDrafts,
  subscribeStoredThreadComposeDrafts,
  type StoredThreadComposeDraft,
} from '../utils/threadComposeDraftStorage';
import { getPublicProfilePath, USER_CENTER_PATH } from '../utils/userRoutes';
import { getThreadComposeHref } from '../utils/threadRoutes';

type OpenDialog = 'avatar' | 'email' | 'security' | null;
type PageNotice = { message: string; tone: 'error' | 'success' } | null;

export function UserCenterPage() {
  const { logout, status: authStatus, updateViewerAvatar, viewer } = useAuth();
  const profileState = useUserCenterProfile(authStatus === 'authenticated');
  const profile = authStatus === 'authenticated' ? profileState.data : null;
  const draftOwnerKey = viewer?.username ?? null;
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [replyDrafts, setReplyDrafts] = useState<StoredReplyDraft[]>([]);
  const [threadComposeDrafts, setThreadComposeDrafts] = useState<StoredThreadComposeDraft[]>([]);
  const [cachedAvatarSrc, setCachedAvatarSrc] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(() => window.location.hash === '#account-security' ? 'security' : null);
  const [notice, setNotice] = useState<PageNotice>(null);
  const email = useMemo(
    () => profile?.details.find((detail) => detail.key === 'email')?.value ?? '',
    [profile?.details],
  );
  const workspaceRecords = useMemo<ProfileRecordMap | null>(() => {
    if (!profile) return null;
    return {
      ...profile.records,
      drafts: [
        ...profile.records.drafts,
        ...threadComposeDrafts.map(mapThreadComposeDraftRecord),
        ...replyDrafts.map(mapReplyDraftRecord),
      ],
    };
  }, [profile, replyDrafts, threadComposeDrafts]);

  useEffect(() => {
    if (!profile || isEditing) return;
    setDraft(createDraft(profile.details, profile.intro));
  }, [isEditing, profile]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    let active = true;
    const refreshReplyDrafts = () => {
      void readStoredReplyDrafts(draftOwnerKey).then((storedDrafts) => {
        if (active) setReplyDrafts(storedDrafts);
      });
    };
    refreshReplyDrafts();
    const unsubscribe = subscribeStoredReplyDrafts(refreshReplyDrafts, draftOwnerKey);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [draftOwnerKey]);

  useEffect(() => {
    let active = true;
    const refreshThreadComposeDrafts = () => {
      void readStoredThreadComposeDrafts(draftOwnerKey).then((storedDrafts) => {
        if (active) setThreadComposeDrafts(storedDrafts);
      });
    };
    refreshThreadComposeDrafts();
    const unsubscribe = subscribeStoredThreadComposeDrafts(refreshThreadComposeDrafts, draftOwnerKey);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [draftOwnerKey]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setCachedAvatarSrc(null);

    if (profile) {
      void readCachedUserAvatarBlob(profile.id, profile.avatarSrc).then((blob) => {
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setCachedAvatarSrc(objectUrl);
      });
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile?.avatarSrc, profile?.id]);

  useEffect(() => {
    function openAccountSecurityFromHash() {
      if (window.location.hash === '#account-security') setOpenDialog('security');
    }

    window.addEventListener('hashchange', openAccountSecurityFromHash);
    return () => window.removeEventListener('hashchange', openAccountSecurityFromHash);
  }, []);

  function closeDialog() {
    setOpenDialog(null);
    if (window.location.hash === '#account-security') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }

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
    const authPending = authStatus === 'loading' || authStatus === 'restoring';
    const loginRequired = authStatus === 'guest';
    return (
      <ProfileLoadPage
        error={loginRequired ? '登录后才能查看和修改个人资料。' : profileState.error}
        loading={!loginRequired && (authPending || profileState.status === 'loading')}
        loginHref={loginRequired ? `/login?returnTo=${encodeURIComponent(USER_CENTER_PATH)}` : undefined}
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
          avatarSrc={cachedAvatarSrc ?? profile.avatarSrc}
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
          initialRecords={workspaceRecords ?? profile.records}
          onSaveSignatures={updateProfileSignatures}
          ownerLabel="我"
        />
      </main>

      <AvatarDialog
        avatarSrc={cachedAvatarSrc ?? profile.avatarSrc}
        onClose={closeDialog}
        onSave={async (src) => {
          const croppedAvatarBlob = src.startsWith('data:image/')
            ? await fetch(src).then((response) => response.blob())
            : null;
          const updatedProfile = await updateProfileAvatar(src);
          if (croppedAvatarBlob) {
            await writeCachedUserAvatarBlob(profile.id, updatedProfile.avatarSrc, croppedAvatarBlob);
          } else {
            await deleteCachedUserAvatar(profile.id);
          }
          profileState.replace(updatedProfile);
          updateViewerAvatar(updatedProfile.avatarSrc);
          setNotice({ message: '头像修改成功', tone: 'success' });
        }}
        open={openDialog === 'avatar'}
      />
      <EmailDialog
        email={email}
        onClose={closeDialog}
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
        onClose={closeDialog}
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
  loginHref,
  loading,
  onRetry,
}: {
  error: string;
  loginHref?: string;
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
          <h1>{loading ? '正在确认登录状态' : loginHref ? '请先登录' : '个人资料加载失败'}</h1>
          {!loading ? <p>{error}</p> : null}
          {!loading && loginHref ? <a href={loginHref}>前往登录</a> : null}
          {!loading && !loginHref ? <button type="button" onClick={onRetry}><RefreshCw size={15} />重新加载</button> : null}
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

function mapReplyDraftRecord(draft: StoredReplyDraft) {
  return {
    board: draft.board,
    date: draft.updatedAt.slice(0, 10),
    excerpt: draft.excerpt || '附件回复草稿',
    href: getThreadComposeHref(draft.bid, draft.tid),
    id: draft.id,
    status: '回帖草稿',
    title: draft.threadTitle,
  };
}

function mapThreadComposeDraftRecord(draft: StoredThreadComposeDraft) {
  return {
    board: draft.board,
    date: draft.updatedAt.slice(0, 10),
    excerpt: draft.excerpt,
    href: getThreadComposeHref(draft.bid, undefined, draft.kind === 'activity' ? 'activity' : 'thread'),
    id: draft.id,
    status: draft.kind === 'activity' ? '活动草稿' : '发帖草稿',
    title: draft.title,
  };
}

function getPageError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
