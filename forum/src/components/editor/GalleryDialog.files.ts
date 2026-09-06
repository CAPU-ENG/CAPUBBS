export async function snapshotGalleryImageFile(file: File): Promise<File> {
  try {
    // Copy bytes immediately: wrapping the original File in another File still
    // leaves the browser dependent on its clipboard or disk-backed source.
    const bytes = await file.arrayBuffer();
    return new File([bytes], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  } catch {
    throw new Error(`无法读取图片“${file.name}”，请重新复制粘贴或从本地选择该图片。`);
  }
}
