import { RefreshCw, UserRoundX } from 'lucide-react';
import { useCallback, useState } from 'react';
import { fetchProfileRecordPage, fetchPublicProfileActivities, sendProfilePrivateMessage } from '../api/profile';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { PrivateMessageDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import { useAuth } from '../context/AuthContext';
import type { ProfileTab } from '../data/profile';
import { usePublicProfile } from '../hooks/useProfileData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const PUBLIC_PROFILE_LAZY_TABS: ProfileTab[] = ['activities'];

export function PublicProfilePage({ profileName }: { profileName: string | null }) {
  const { status: authStatus, viewer } = useAuth();
  const viewerUsername = authStatus === 'authenticated' ? viewer?.username : undefined;
  const profileState = usePublicProfile(profileName);
  const [messageOpen, setMessageOpen] = useState(false);
  const loadedProfile = profileState.data;
  const loadTab = useCallback((tab: ProfileTab) => {
    if (tab === 'activities' && loadedProfile) return fetchPublicProfileActivities(loadedProfile.profile.id);
    return Promise.resolve(loadedProfile?.profile.records[tab] ?? []);
  }, [loadedProfile]);
  const loadMore = useCallback((tab: ProfileTab, offset: number) => {
    if ((tab === 'posts' || tab === 'replies') && loadedProfile) {
      return fetchProfileRecordPage(loadedProfile.profile.id, tab, offset);
    }
    return Promise.resolve({ hasMore: false, records: [] });
  }, [loadedProfile]);
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

  const { profile } = loadedProfile;
  const canViewActivities = Boolean(viewerUsername);
  const isOwnProfile = profile.id === viewerUsername;
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
          initialHasMore={profile.recordHasMore}
          initialRecords={profile.records}
          lazyTabs={PUBLIC_PROFILE_LAZY_TABS}
          ownerLabel={profile.id}
          readOnly
          onLoadTab={loadTab}
          onLoadMore={loadMore}
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
