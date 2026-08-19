import { UserRoundX } from 'lucide-react';
import { useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { PrivateMessageDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import { currentProfile, findPublicProfile, type ProfileTab } from '../data/profileDemo';

export function PublicProfilePage({ profileName }: { profileName: string | null }) {
  const profile = findPublicProfile(profileName);
  const [messageOpen, setMessageOpen] = useState(false);

  if (!profile) {
    return <PublicProfileNotFound />;
  }

  const isOwnProfile = profile.slug === currentProfile.slug;
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
        open={messageOpen}
        recipient={profile.id}
      />
    </div>
  );
}

function PublicProfileNotFound() {
  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell profile-not-found-wrap">
        <section className="profile-not-found">
          <UserRoundX size={34} />
          <span className="eyebrow">PROFILE NOT FOUND</span>
          <h1>没有找到这位用户</h1>
          <p>用户名可能已经变更，或者当前链接并不完整。</p>
          <a href="/">返回论坛首页</a>
        </section>
      </main>
    </div>
  );
}
