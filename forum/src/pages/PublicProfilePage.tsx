import { LoaderCircle, RefreshCw, UserRoundX } from 'lucide-react';
import { useState } from 'react';
import { sendProfilePrivateMessage } from '../api/profile';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { PrivateMessageDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import type { ProfileTab } from '../data/profileDemo';
import { usePublicProfile } from '../hooks/useProfileData';

export function PublicProfilePage({ profileName }: { profileName: string | null }) {
  const profileState = usePublicProfile(profileName);
  const [messageOpen, setMessageOpen] = useState(false);
  const loadedProfile = profileState.data;

  if (!loadedProfile) {
    return (
      <PublicProfileState
        error={profileState.error}
        loading={profileState.status === 'loading'}
        onRetry={profileState.reload}
      />
    );
  }

  const { isOwnProfile, profile } = loadedProfile;
  const allowedTabs: ProfileTab[] = isOwnProfile
    ? ['posts', 'replies', 'activities', 'bookmarks']
    : ['posts', 'replies', 'activities'];

  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell">
        <ProfileOverview
          emailVisible={profile.emailVisible}
          isOwnPublicProfile={isOwnProfile}
          mode="public"
          profile={profile}
          onPrivateMessage={() => setMessageOpen(true)}
        />

        <ProfileWorkspace
          allowedTabs={allowedTabs}
          initialRecords={profile.records}
          ownerLabel={profile.id}
          readOnly
        />
      </main>

      <PrivateMessageDialog
        onClose={() => setMessageOpen(false)}
        onSend={(message) => sendProfilePrivateMessage(profile.id, message)}
        open={messageOpen}
        recipient={profile.id}
      />
    </div>
  );
}

function PublicProfileState({
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
          {loading ? <LoaderCircle className="profile-loading-icon" size={34} /> : <UserRoundX size={34} />}
          <h1>{loading ? '正在加载个人主页' : '没有找到这位用户'}</h1>
          <p>{loading ? '正在连接论坛服务，请稍候。' : error || '用户名可能已经变更，或者当前链接并不完整。'}</p>
          {!loading ? <button type="button" onClick={onRetry}><RefreshCw size={15} />重新加载</button> : null}
        </section>
      </main>
    </div>
  );
}
