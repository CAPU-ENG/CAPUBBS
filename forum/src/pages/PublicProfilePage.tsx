import { RefreshCw, UserRoundX } from 'lucide-react';
import { useState } from 'react';
import { sendProfilePrivateMessage } from '../api/profile';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { PrivateMessageDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import type { ProfileTab } from '../data/profile';
import { usePublicProfile } from '../hooks/useProfileData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function PublicProfilePage({ profileName }: { profileName: string | null }) {
  const profileState = usePublicProfile(profileName);
  const [messageOpen, setMessageOpen] = useState(false);
  const loadedProfile = profileState.data;
  useDocumentTitle(loadedProfile?.profile.id
    ?? (profileState.status === 'loading' ? '正在加载个人主页' : '没有找到这位用户'));

  if (!loadedProfile) {
    return (
      <PublicProfileState
        error={profileState.error}
        loading={profileState.status === 'loading'}
        onRetry={profileState.reload}
      />
    );
  }

  const { canViewActivities, isOwnProfile, profile } = loadedProfile;
  const allowedTabs: ProfileTab[] = canViewActivities
    ? ['posts', 'replies', 'activities']
    : ['posts', 'replies'];

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
      <main className={`profile-page-shell${loading ? '' : ' profile-not-found-wrap'}`}>
        {loading ? (
          <LoadingState label="正在加载个人主页" />
        ) : (
          <section className="profile-not-found" role="alert">
            <UserRoundX size={34} />
            <h1>没有找到这位用户</h1>
            <p>{error || '用户名可能已经变更，或者当前链接并不完整。'}</p>
            <button type="button" onClick={onRetry}><RefreshCw size={15} />重新加载</button>
          </section>
        )}
      </main>
    </div>
  );
}
