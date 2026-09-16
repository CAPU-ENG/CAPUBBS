export type ForumClientType = 'desktop' | 'mobile';

export const FORUM_PRESENCE_CHANGE_EVENT = 'capubbs:presence-change';

type ForumDeviceInfo = {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentData?: { mobile?: boolean };
};

export function getForumClientType(device: ForumDeviceInfo = navigator): ForumClientType {
  const mobile = device.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod|Mobile/i.test(device.userAgent)
    // iPadOS can identify itself as a Mac when requesting desktop websites.
    || (device.platform === 'MacIntel' && (device.maxTouchPoints ?? 0) > 1);
  return mobile ? 'mobile' : 'desktop';
}
