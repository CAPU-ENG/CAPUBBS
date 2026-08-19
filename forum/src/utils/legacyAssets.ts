const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';

export function normalizeLegacyAvatar(value: unknown) {
  if (typeof value !== 'string') return '';
  const avatar = value.trim();

  if (!avatar) return '';
  if (/^data:image\//i.test(avatar)) return avatar;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  if (avatar.startsWith('//')) return `https:${avatar}`;
  if (avatar.startsWith('/')) return `${PUBLIC_ASSET_ORIGIN}${avatar}`;
  if (/^\d+$/.test(avatar)) return `${PUBLIC_ASSET_ORIGIN}/bbsimg/i/${avatar}.gif`;
  return `${PUBLIC_ASSET_ORIGIN}/bbsimg/icons/${avatar.replace(/^\.?\//, '')}`;
}
