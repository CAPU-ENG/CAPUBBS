const LOCAL_AVATAR_ROOT = '/bbsimg';
const LOCAL_ARCHIVED_AVATAR_ROOT = `${LOCAL_AVATAR_ROOT}/icons/user_archive/files`;

export function normalizeLegacyAvatar(value: unknown) {
  if (typeof value !== 'string') return '';
  const avatar = value.trim();

  if (!avatar) return '';
  if (/^data:image\//i.test(avatar)) return avatar;
  if (/^(?:https?:)?\/\//i.test(avatar)) return localizeAbsoluteAvatar(avatar);
  if (avatar.startsWith(`${LOCAL_AVATAR_ROOT}/`)) return avatar;
  if (/^u?\d+$/i.test(avatar)) return `${LOCAL_AVATAR_ROOT}/i/${avatar}.gif`;

  const relativeAvatar = avatar.replace(/^\.?\//, '');
  if (relativeAvatar.startsWith('bbsimg/')) return `/${relativeAvatar}`;
  if (relativeAvatar.startsWith('icons/')) return `${LOCAL_AVATAR_ROOT}/${relativeAvatar}`;
  return `${LOCAL_AVATAR_ROOT}/icons/${relativeAvatar}`;
}

function localizeAbsoluteAvatar(value: string) {
  try {
    const url = new URL(value, 'http://local.invalid');
    if (url.pathname.startsWith(`${LOCAL_AVATAR_ROOT}/`)) {
      return `${url.pathname}${url.search}`;
    }

    const filename = url.pathname.split('/').filter(Boolean).at(-1);
    return filename ? `${LOCAL_ARCHIVED_AVATAR_ROOT}/${filename}` : '';
  } catch {
    return '';
  }
}
