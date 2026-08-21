const LOCAL_AVATAR_ROOT = '/bbsimg';
const LOCAL_ARCHIVED_AVATAR_ROOT = `${LOCAL_AVATAR_ROOT}/icons/user_archive/files`;
const LOCAL_POST_IMAGE_ROOT = '/bbs/images';
const CHEXIE_IMAGE_ELEMENT_PATTERN = /<(?:body|image|img|input|source|table|td|th|video)\b[^>]*>/gi;
const INLINE_STYLE_ATTRIBUTE_PATTERN = /\bstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const STYLE_ELEMENT_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const CHEXIE_ORIGIN_PATTERN = /(?:https?:)?\/\/(?:[a-z\d-]+\.)*chexie\.net(?=\/)/gi;

export function localizeChexieImageRequests(value: string) {
  if (!value || !/chexie\.net/i.test(value)) return value;

  return value
    .replace(CHEXIE_IMAGE_ELEMENT_PATTERN, localizeChexieOrigins)
    .replace(INLINE_STYLE_ATTRIBUTE_PATTERN, localizeChexieOrigins)
    .replace(STYLE_ELEMENT_PATTERN, localizeChexieOrigins);
}

function localizeChexieOrigins(value: string) {
  return value.replace(CHEXIE_ORIGIN_PATTERN, '');
}

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

export function normalizeLegacyPostImage(value: unknown) {
  if (typeof value !== 'string') return '';
  const image = value.trim();

  if (!image) return '';
  if (/^data:image\/(?:avif|gif|jpeg|png|webp);/i.test(image)) return image;
  if (/^(?:https?:)?\/\//i.test(image)) return localizeAbsolutePostImage(image);
  if (image.startsWith('/')) return image;

  const legacyImage = image.match(/^(?:(?:\.\.\/)+)?images\/([^\s]+)$/i);
  if (legacyImage) return `${LOCAL_POST_IMAGE_ROOT}/${legacyImage[1]}`;
  if (/^\d+$/.test(image)) return `${LOCAL_AVATAR_ROOT}/i/${image}.gif`;

  try {
    const url = new URL(image, 'http://local.invalid/bbs/content/');
    if (url.origin !== 'http://local.invalid') return '';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '';
  }
}

function localizeAbsolutePostImage(value: string) {
  const absoluteValue = value.startsWith('//') ? `https:${value}` : value;

  try {
    const url = new URL(absoluteValue);
    if (url.hostname === 'chexie.net' || url.hostname.endsWith('.chexie.net')) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return absoluteValue;
  } catch {
    return '';
  }
}
