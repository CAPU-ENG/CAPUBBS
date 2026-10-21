export async function createFloorDecorationFile(dataUrl: string, variant: 'light' | 'dark') {
  const blob = await fetch(dataUrl).then((response) => response.blob());
  const extension = blob.type === 'image/webp' ? 'webp' : 'png';
  return new File([blob], `floor-decoration-${variant}.${extension}`, { type: blob.type });
}
