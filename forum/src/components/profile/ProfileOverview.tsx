import { AtSign, Bike, Edit3, ExternalLink, Mail, MapPin, MessageCircle, Palette, ShieldCheck } from 'lucide-react';
import { useState, type ComponentType, type SVGProps } from 'react';
import type { ProfileDetailKey, ProfileViewData } from '../../data/profile';
import { getDisplayedTags } from '../../data/tags';
import { USER_CENTER_HREF } from '../../utils/userRoutes';
import { StarRulesDialog } from './ProfileDialogs';
import { ProfileActivityDialog } from './ProfileActivityDialog';
import { ProfileMedalGallery } from '../medals/ProfileMedalGallery';
import { DialogPresence } from '../layout/DialogPresence';
import { TagList } from '../tags/TagBadge';
import { ThreadImageLightbox } from '../thread/ThreadImageLightbox';
import { useTheme } from '../../hooks/useTheme';
import { useStaggerEntrance } from '../../hooks/useStaggerEntrance';
import { getFloorDecorationPath } from '../../data/floorDecoration';

export type ProfileDraft = {
  hobby: string;
  intro: string;
  location: string;
  qq: string;
};

export type ProfileTextDraftKey = keyof ProfileDraft;

type ProfileOverviewProps = {
  actionsDisabled?: boolean;
  avatarSrc?: string;
  draft?: ProfileDraft;
  emailVisible?: boolean;
  isEditing?: boolean;
  isOwnPublicProfile?: boolean;
  mode: 'private' | 'public';
  onAvatarClick?: () => void;
  onCancelEdit?: () => void;
  onDraftChange?: (key: ProfileTextDraftKey, value: string) => void;
  onEditToggle?: () => void;
  onOpenEmail?: () => void;
  onOpenPersonalization?: () => void;
  onOpenSecurity?: () => void;
  onPrivateMessage?: () => void;
  profile: ProfileViewData;
};

const detailIcons: Record<ProfileDetailKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  email: Mail,
  hobby: Bike,
  location: MapPin,
  qq: AtSign,
};

export function ProfileOverview({
  actionsDisabled = false,
  avatarSrc,
  draft,
  emailVisible,
  isEditing = false,
  isOwnPublicProfile = false,
  mode,
  onAvatarClick,
  onCancelEdit,
  onDraftChange,
  onEditToggle,
  onOpenEmail,
  onOpenPersonalization,
  onOpenSecurity,
  onPrivateMessage,
  profile,
}: ProfileOverviewProps) {
  const badgesRef = useStaggerEntrance<HTMLDivElement>([
    ':scope > .user-tag-list > .user-tag',
    ':scope > .profile-identity-medals > .profile-identity-medal-button',
  ].join(', '));
  const privateMode = mode === 'private';
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [starRulesOpen, setStarRulesOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const { theme } = useTheme();
  const decorationImageSrc = getFloorDecorationPath(profile.floorDecoration, theme);
  const visibleIntro = isEditing && draft ? draft.intro : profile.intro;
  const tags = profile.tags ?? [];
  const selectedTagIds = getDisplayedTags(tags).map((tag) => tag.id);
  const visibleMedals = (profile.medals ?? []).filter((medal) => medal.state !== 'hidden');
  const details = profile.details.map((detail) => {
    if (detail.key === 'email') {
      if (privateMode || isOwnPublicProfile) return detail;
      return { ...detail, value: emailVisible ? detail.value : '未公开' };
    }

    if (isEditing && draft && detail.key in draft) {
      return { ...detail, value: draft[detail.key as ProfileTextDraftKey] };
    }

    return detail;
  });
  const privateActions = (
    <>
      <button className="profile-primary-action" disabled={actionsDisabled} type="button" onClick={onEditToggle}>
        <Edit3 size={16} />{actionsDisabled ? '保存中' : isEditing ? '保存资料' : '编辑资料'}
      </button>
      {isEditing ? (
        <button className="profile-secondary-action" disabled={actionsDisabled} type="button" onClick={onCancelEdit}>取消</button>
      ) : (
        <>
          <button className="profile-secondary-action" disabled={actionsDisabled} type="button" onClick={onOpenPersonalization}>
            <Palette size={16} />个性化
          </button>
          <button className="profile-secondary-action" disabled={actionsDisabled} type="button" onClick={onOpenSecurity}>
            <ShieldCheck size={16} />修改密码
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="profile-overview" aria-label={privateMode ? '个人资料' : `${profile.id}的公开资料`}>
      <section className={`profile-identity-card${decorationImageSrc ? ' profile-identity-card-decorated' : ''}`}>
        {decorationImageSrc ? (
          <span aria-hidden="true" className="profile-identity-decoration"><img alt="" src={decorationImageSrc} /></span>
        ) : null}
        <div className="profile-file-stamp" aria-hidden="true">
          <span>CAPU</span>
          <small>RIDER PROFILE</small>
        </div>

        <div className="profile-identity-main">
          {privateMode ? (
            <button className="profile-avatar-button" type="button" onClick={onAvatarClick} aria-label="查看或更换头像">
              <img src={avatarSrc ?? profile.avatarSrc} alt={`${profile.id}的头像`} />
            </button>
          ) : (
            <button
              aria-label="查看头像大图"
              aria-haspopup="dialog"
              className="profile-avatar-button"
              onClick={() => setAvatarPreviewOpen(true)}
              type="button"
            >
              <img src={avatarSrc ?? profile.avatarSrc} alt={`${profile.id}的头像`} />
            </button>
          )}

          <div className="profile-identity-copy" ref={badgesRef}>
            <div className="profile-name-line">
              <h1>{profile.id}</h1>
              <button
                aria-label={`${profile.rating}星用户，查看星级规则`}
                className="profile-rating"
                onClick={() => setStarRulesOpen(true)}
                type="button"
              >
                {'★'.repeat(profile.rating)}
              </button>
            </div>

            {isEditing && draft ? (
              <label className="profile-intro-editor">
                <span>个人简介</span>
                <textarea
                  maxLength={400}
                  rows={2}
                  value={visibleIntro}
                  onChange={(event) => onDraftChange?.('intro', event.target.value)}
                />
              </label>
            ) : (
              <p className="profile-intro">{visibleIntro || '暂未填写个人简介。'}</p>
            )}
            <TagList selectedTagIds={selectedTagIds} tags={tags} />
            <ProfileMedalGallery medals={visibleMedals} />
          </div>
        </div>

        <div className={`profile-identity-actions${privateMode ? ' profile-identity-actions-desktop' : ''}`}>
          {privateMode ? privateActions : isOwnPublicProfile ? (
            <a className="profile-primary-action" href={USER_CENTER_HREF}>
              <ExternalLink size={16} />进入个人中心
            </a>
          ) : (
            <button className="profile-primary-action" type="button" onClick={onPrivateMessage}>
              <MessageCircle size={16} />发私信
            </button>
          )}
        </div>
      </section>

      {privateMode ? (
        <div className="profile-identity-actions profile-identity-actions-mobile">
          {privateActions}
        </div>
      ) : null}

      <div className="profile-detail-grid">
        {details.map((detail) => {
          const Icon = detailIcons[detail.key];
          const editable = isEditing && detail.key !== 'email';
          const isEmail = detail.key === 'email';

          return (
            <section className="profile-data-card" key={detail.key}>
              <div className="profile-data-card-head">
                <div className="profile-data-label"><Icon width={15} height={15} />{detail.label}</div>
                {isEmail && privateMode ? (
                  <button className="profile-inline-action" type="button" onClick={onOpenEmail}>
                    管理
                  </button>
                ) : null}
              </div>
              {editable && draft ? (
                <input
                  aria-label={detail.label}
                  value={detail.value}
                  onChange={(event) => onDraftChange?.(detail.key as ProfileTextDraftKey, event.target.value)}
                />
              ) : (
                <div className={`profile-data-value ${detail.value === '未公开' ? 'profile-data-private' : ''}`}>
                  {detail.value || '未填写'}
                  {isEmail && privateMode && detail.value.trim() ? (
                    <span className="profile-email-visibility">{emailVisible ? '公开' : '私密'}</span>
                  ) : null}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="profile-stat-grid">
        {profile.stats.map((stat) => (
          <section className="profile-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            {stat.label === '签到数' ? (
              <button
                aria-haspopup="dialog"
                aria-label={`签到 ${stat.value} 次，查看活跃度`}
                className="profile-stat-activity"
                onClick={() => setActivityOpen(true)}
                type="button"
              ><strong>{stat.value}</strong></button>
            ) : <strong>{stat.value}</strong>}
          </section>
        ))}
      </div>

      <DialogPresence>{!privateMode && avatarPreviewOpen && (
        <ThreadImageLightbox
          images={[{ alt: '', src: avatarSrc ?? profile.avatarSrc }]}
          initialImageIndex={0}
          onClose={() => setAvatarPreviewOpen(false)}
        />
      )}</DialogPresence>

      <StarRulesDialog
        currentPostReplyCount={profile.starPostReplyCount}
        currentRating={profile.rating}
        onClose={() => setStarRulesOpen(false)}
        open={starRulesOpen}
      />
      <DialogPresence mobileSize="compact">{activityOpen && (
        <ProfileActivityDialog key={profile.id} onClose={() => setActivityOpen(false)} username={profile.id} />
      )}</DialogPresence>
    </div>
  );
}
