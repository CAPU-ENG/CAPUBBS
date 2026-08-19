import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { AvatarDialog, EmailDialog, SecurityDialog } from '../components/profile/ProfileDialogs';
import { ProfileOverview, type ProfileDraft } from '../components/profile/ProfileOverview';
import { ProfileWorkspace } from '../components/profile/ProfileWorkspace';
import { currentProfile, type ProfileDetail } from '../data/profileDemo';

type OpenDialog = 'avatar' | 'email' | 'security' | null;
type PageNotice = { message: string; tone: 'error' | 'success' } | null;

export function UserCenterPage() {
  const [profile, setProfile] = useState(currentProfile);
  const [avatarSrc, setAvatarSrc] = useState(currentProfile.avatarSrc);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => createDraft(currentProfile.details, currentProfile.intro));
  const [openDialog, setOpenDialog] = useState<OpenDialog>(() => window.location.hash === '#account-security' ? 'security' : null);
  const [notice, setNotice] = useState<PageNotice>(null);
  const email = useMemo(() => profile.details.find((detail) => detail.key === 'email')?.value ?? '', [profile.details]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateDraft(key: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleEdit() {
    if (!isEditing) {
      setDraft(createDraft(profile.details, profile.intro));
      setNotice(null);
      setIsEditing(true);
      return;
    }

    setProfile((current) => ({
      ...current,
      details: current.details.map((detail) => detail.key === 'email' ? detail : { ...detail, value: draft[detail.key] }),
      intro: draft.intro,
    }));
    setIsEditing(false);
    setNotice({ message: '资料保存成功', tone: 'success' });
  }

  function cancelEdit() {
    setDraft(createDraft(profile.details, profile.intro));
    setIsEditing(false);
    setNotice({ message: '已取消本次修改', tone: 'success' });
  }

  function saveEmail(nextEmail: string, nextVisible: boolean) {
    setProfile((current) => ({
      ...current,
      details: current.details.map((detail) => detail.key === 'email' ? { ...detail, value: nextEmail } : detail),
      emailVisible: nextVisible,
    }));
  }

  return (
    <div className="profile-page min-h-screen text-[var(--text)]">
      <AppBackground />
      <TopBar />
      <main className="profile-page-shell">
        <ProfileOverview
          avatarSrc={avatarSrc}
          draft={draft}
          emailVisible={profile.emailVisible}
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

        {notice ? createPortal(
          <div className={`profile-toast ${notice.tone === 'error' ? 'profile-toast-error' : ''}`} role="status">
            {notice.message}
          </div>,
          document.body,
        ) : null}

        <ProfileWorkspace
          allowedTabs={['posts', 'replies', 'activities', 'bookmarks', 'drafts', 'signatures']}
          asideLink={{ href: `/users/${encodeURIComponent(profile.slug)}`, label: '查看公开个人主页' }}
          initialRecords={profile.records}
          ownerLabel="我"
        />
      </main>

      <AvatarDialog
        avatarSrc={avatarSrc}
        onClose={() => setOpenDialog(null)}
        onSave={(src) => { setAvatarSrc(src); setNotice({ message: '头像修改成功', tone: 'success' }); }}
        open={openDialog === 'avatar'}
      />
      <EmailDialog
        email={email}
        onClose={() => setOpenDialog(null)}
        onNotify={(message, tone) => setNotice({ message, tone })}
        onSave={saveEmail}
        open={openDialog === 'email'}
        visible={profile.emailVisible}
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
