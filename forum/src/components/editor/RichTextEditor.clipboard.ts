export function getClipboardImageFile(clipboardData: DataTransfer) {
  // Word and other rich-text editors can expose the same copied selection as
  // both text and a generated image preview. Preserve the user's text paste in
  // that case, and only open the image flow for an image-only clipboard.
  if (clipboardData.getData('text/plain').trim()) {
    return null;
  }

  const file = Array.from(clipboardData.files).find((item) => item.type.startsWith('image/'));

  if (file) {
    return file;
  }

  const imageItem = Array.from(clipboardData.items).find((item) => item.kind === 'file' && item.type.startsWith('image/'));

  return imageItem?.getAsFile() ?? null;
}
