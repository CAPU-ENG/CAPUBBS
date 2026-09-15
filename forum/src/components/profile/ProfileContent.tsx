import { ChevronRight, ExternalLink } from 'lucide-react';
import { profileTabs } from '../../data/profile';
import type { useProfileContentNavigation } from '../../hooks/useProfileContentNavigation';
import { getProfileTabHref } from '../../utils/userRoutes';
import { ProfileWorkspace, type ProfileWorkspaceProps } from './ProfileWorkspace';
import { ProfileTabIcon } from './ProfileTabIcon';

type ProfileContentProps = ProfileWorkspaceProps & {
  navigation: ReturnType<typeof useProfileContentNavigation>;
  overviewHref: string;
};

export function ProfileContent({ navigation, overviewHref, ...workspaceProps }: ProfileContentProps) {
  const { allowedTabs, asideLink, readOnly } = workspaceProps;
  if (navigation.isMobile && !navigation.isContentPage) {
    return (
      <div className="profile-content-menu">
        <nav className="profile-content-links" aria-label="个人内容分类">
          {profileTabs.filter((tab) => allowedTabs.includes(tab.key)).map((tab) => (
            <a href={getProfileTabHref(overviewHref, tab.key)} key={tab.key}>
              <span className="profile-content-link-label"><ProfileTabIcon tab={tab.key} size={17} />{tab.label}</span>
              <ChevronRight aria-hidden="true" size={17} />
            </a>
          ))}
        </nav>
        {asideLink ? (
          <a className="profile-aside-link" href={asideLink.href}>
            <span>{asideLink.label}</span><ExternalLink aria-hidden="true" size={15} />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <ProfileWorkspace
      {...workspaceProps}
      backLink={navigation.isContentPage ? {
        href: overviewHref,
        label: readOnly ? '个人主页' : '个人中心',
      } : undefined}
      key={`${overviewHref}:${navigation.isContentPage ? navigation.requestedTab : 'overview'}`}
    />
  );
}
