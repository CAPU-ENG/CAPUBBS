import { AtSign, Bike, Edit3, ExternalLink, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState, type ComponentType, type SVGProps } from 'react';
import type { ProfileDetailKey, ProfileViewData } from '../../data/profileDemo';
import { USER_CENTER_PATH } from '../../utils/userRoutes';
import { StarRulesDialog } from './ProfileDialogs';

export type ProfileDraft = {
  hobby: string;
  intro: string;
  location: string;
  qq: string;
};

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
  onDraftChange?: (key: keyof ProfileDraft, value: string) => void;
  onEditToggle?: () => void;
  onOpenEmail?: () => void;
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
  onOpenSecurity,
  onPrivateMessage,
  profile,
}: ProfileOverviewProps) {
  const privateMode = mode === 'private';
  const [starRulesOpen, setStarRulesOpen] = useState(false);
  const visibleIntro = isEditing && draft ? draft.intro : profile.intro;
  const details = profile.details.map((detail) => {
    if (detail.key === 'email') {
      if (privateMode || isOwnPublicProfile) return detail;
      return { ...detail, value: emailVisible ? detail.value : '未公开' };
    }

    if (isEditing && draft && detail.key in draft) {
      return { ...detail, value: draft[detail.key as keyof ProfileDraft] };
    }

    return detail;
  });

  return (
    <div className="profile-overview" aria-label={privateMode ? '个人资料' : `${profile.id}的公开资料`}>
      <section className="profile-identity-card">
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
            <div className="profile-avatar-static">
              <img src={avatarSrc ?? profile.avatarSrc} alt={`${profile.id}的头像`} />
            </div>
          )}

          <div className="profile-identity-copy">
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
          </div>
        </div>

        <div className="profile-identity-actions">
          {privateMode ? (
            <>
              <button className="profile-primary-action" disabled={actionsDisabled} type="button" onClick={onEditToggle}>
                <Edit3 size={16} />{actionsDisabled ? '保存中' : isEditing ? '保存资料' : '编辑资料'}
              </button>
              {isEditing ? (
                <button className="profile-secondary-action" disabled={actionsDisabled} type="button" onClick={onCancelEdit}>取消</button>
              ) : (
                <button className="profile-secondary-action" disabled={actionsDisabled} type="button" onClick={onOpenSecurity}>
                  <ShieldCheck size={16} />账号安全
                </button>
              )}
            </>
          ) : isOwnPublicProfile ? (
            <a className="profile-primary-action" href={USER_CENTER_PATH}>
              <ExternalLink size={16} />进入个人中心
            </a>
          ) : (
            <button className="profile-primary-action" type="button" onClick={onPrivateMessage}>
              <MessageCircle size={16} />发私信
            </button>
          )}
        </div>
      </section>

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
                    {emailVisible ? '已公开' : '私密'} · 管理
                  </button>
                ) : null}
              </div>
              {editable && draft ? (
                <input
                  aria-label={detail.label}
                  value={detail.value}
                  onChange={(event) => onDraftChange?.(detail.key as keyof ProfileDraft, event.target.value)}
                />
              ) : (
                <div className={`profile-data-value ${detail.value === '未公开' ? 'profile-data-private' : ''}`}>
                  {detail.value || '未填写'}
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
            <strong>{stat.value}</strong>
          </section>
        ))}
      </div>

      <StarRulesDialog
        currentRating={profile.rating}
        onClose={() => setStarRulesOpen(false)}
        open={starRulesOpen}
      />
    </div>
  );
}
