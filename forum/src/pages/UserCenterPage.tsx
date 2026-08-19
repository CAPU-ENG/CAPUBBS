import { useMemo, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { AvatarDialog, EmailDialog, SecurityDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview, type ProfileDraft } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import { currentProfile, type ProfileDetail } from '../data/profileDemo';

type OpenDialog = 'avatar' | 'email' | 'security' | null;

export function UserCenterPage() {
  const [profile, setProfile] = useState(currentProfile);
  const [avatarSrc, setAvatarSrc] = useState(currentProfile.avatarSrc);
  const [emailVisible, setEmailVisible] = useState(currentProfile.emailVisible);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => createDraft(currentProfile.details, currentProfile.intro));
  const [openDialog, setOpenDialog] = useState<OpenDialog>(() => window.location.hash === '#account-security' ? 'security' : null);
  const [notice, setNotice] = useState('');
  const email = useMemo(() => profile.details.find((detail) => detail.key === 'email')?.value ?? '', [profile.details]);

  function updateDraft(key: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleEdit() {
    if (!isEditing) {
      setDraft(createDraft(profile.details, profile.intro));
      setNotice('');
      setIsEditing(true);
      return;
    }

    setProfile((current) => ({
      ...current,
      details: current.details.map((detail) => detail.key === 'email' ? detail : { ...detail, value: draft[detail.key] }),
      intro: draft.intro,
    }));
    setIsEditing(false);
    setNotice('资料已保存到当前页面会话。');
  }

  function cancelEdit() {
    setDraft(createDraft(profile.details, profile.intro));
    setIsEditing(false);
    setNotice('已取消本次修改。');
  }

  function saveEmail(nextEmail: string, nextVisible: boolean) {
    setProfile((current) => ({
      ...current,
      details: current.details.map((detail) => detail.key === 'email' ? { ...detail, value: nextEmail } : detail),
      emailVisible: nextVisible,
    }));
    setEmailVisible(nextVisible);
    setNotice('邮箱设置已保存到当前页面会话。');
  }

  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell">
        <ProfileOverview
          avatarSrc={avatarSrc}
          draft={draft}
          emailVisible={emailVisible}
          isEditing={isEditing}
          mode="private"
          profile={profile}
          onAvatarClick={() => setOpenDialog('avatar')}
          onCancelEdit={cancelEdit}
          onDraftChange={updateDraft}
          onEditToggle={toggleEdit}
          onOpenEmail={() => setOpenDialog('email')}
          onOpenSecurity={() => setOpenDialog('security')}
        />

        {notice ? <div className="profile-page-notice" role="status">{notice}</div> : null}

        <ProfileWorkspace
          allowedTabs={['posts', 'replies', 'activities', 'bookmarks', 'drafts', 'signatures']}
          asideLink={{ href: `/users/${encodeURIComponent(profile.slug)}`, label: '查看公开个人主页' }}
          counts={profile.counts}
          initialRecords={profile.records}
          ownerLabel="我"
        />
      </main>

      <AvatarDialog
        avatarSrc={avatarSrc}
        onClose={() => setOpenDialog(null)}
        onSave={(src) => { setAvatarSrc(src); setNotice('头像已更新到当前页面会话。'); }}
        open={openDialog === 'avatar'}
      />
      <EmailDialog
        email={email}
        onClose={() => setOpenDialog(null)}
        onSave={saveEmail}
        open={openDialog === 'email'}
        visible={emailVisible}
      />
      <SecurityDialog onClose={() => setOpenDialog(null)} open={openDialog === 'security'} />
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
