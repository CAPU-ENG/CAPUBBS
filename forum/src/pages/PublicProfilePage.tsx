import { RefreshCw, UserRoundX } from 'lucide-react';
import { useCallback, useState } from 'react';
import { fetchProfileTabRecords, sendProfilePrivateMessage } from '../api/profile';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingState } from '../components/layout/LoadingState';
import { TopBar } from '../components/layout/TopBar';
import { PrivateMessageDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileContent } from '../components/profile/ProfileContent';
import { useAuth } from '../context/AuthContext';
import { profileTabs, type ProfileTab } from '../data/profile';
import { useProfileContentNavigation } from '../hooks/useProfileContentNavigation';
import { usePublicProfile } from '../hooks/useProfileData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPublicProfilePath } from '../utils/userRoutes';

const PUBLIC_PROFILE_LAZY_TABS: ProfileTab[] = ['posts', 'replies', 'activities'];
const PUBLIC_PROFILE_TABS: ProfileTab[] = ['posts', 'replies', 'activities'];
const PUBLIC_PROFILE_GUEST_TABS: ProfileTab[] = ['posts', 'replies'];

export function PublicProfilePage({ profileName }: { profileName: string | null }) {
  const { status: authStatus, viewer } = useAuth();
  const viewerUsername = authStatus === 'authenticated' ? viewer?.username : undefined;
  const allowedTabs = viewerUsername ? PUBLIC_PROFILE_TABS : PUBLIC_PROFILE_GUEST_TABS;
  const contentNavigation = useProfileContentNavigation(allowedTabs);
  const profileState = usePublicProfile(profileName);
  const [messageOpen, setMessageOpen] = useState(false);
  const loadedProfile = profileState.data;
  const profileId = loadedProfile?.profile.id;
  const loadTab = useCallback((tab: ProfileTab, signal?: AbortSignal) => profileId
    ? fetchProfileTabRecords(profileId, tab, signal)
    : Promise.resolve([]), [profileId]);
  const contentTitle = profileTabs.find((tab) => tab.key === contentNavigation.requestedTab)?.label;
  useDocumentTitle((loadedProfile && contentNavigation.isContentPage
    ? `${loadedProfile.profile.id}的${contentTitle}` : loadedProfile?.profile.id)
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
  const isOwnProfile = profile.id === viewerUsername;

  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell">
        {!contentNavigation.isContentPage ? <ProfileOverview
          emailVisible={profile.emailVisible}
          isOwnPublicProfile={isOwnProfile}
          mode="public"
          profile={profile}
          onPrivateMessage={() => setMessageOpen(true)}
        /> : null}

        <ProfileContent
          allowedTabs={allowedTabs}
          navigation={contentNavigation}
          overviewHref={getPublicProfilePath(profile.id)}
          initialHasMore={profile.recordHasMore}
          initialRecords={profile.records}
          lazyTabs={PUBLIC_PROFILE_LAZY_TABS}
          ownerLabel={profile.id}
          readOnly
          onLoadTab={loadTab}
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
