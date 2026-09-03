import type {
  ChangeEvent,
  ClipboardEvent,
  Dispatch,
  MouseEvent,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react';
import type { GalleryDialogImage, GalleryUploadProgress } from './GalleryDialog';
import {
  buildEditorGalleryHtml,
  getEditorGalleryAction,
  getEditorGalleryEditTarget,
  getEditorGalleryImageHeight,
  getEditorGalleryResizeTarget,
  moveEditorGallery,
  readEditorGallery,
} from './RichTextEditor.gallery';
import type { EditorGalleryImage } from './RichTextEditor.gallery';
import {
  compressImageFileUnderLimit,
  createUploadableImageFileUnderLimit,
  getClipboardImageFile,
  getImageAltText,
  getImageFileDimensions,
  getImageFileMd5Hex,
  uploadEditorImage,
  validateEditorImageFile,
} from './RichTextEditor.images';
import { maxInlineImageBytes } from './RichTextEditor.constants';
import {
  applyGalleryImageHeight,
  applyImageIntrinsicDimensions,
  applyImageWidthPercentage,
  clampImageDimension,
  galleryResizeMaxHeight,
  galleryResizeMinHeight,
  getEditorContentWidth,
  getImageWidthPercentage,
  getResizedImageWidthPercentage,
  richImageResizeMinWidth,
  type ActiveGalleryResize,
  type ActiveRichImageResize,
  type ImageIntrinsicDimensions,
  type RichImageResizeHandle,
} from './RichTextEditor.resize';
import type { PastedImageState, RichTextEditorValue } from './RichTextEditor.types';
import { escapeAttribute } from './RichTextEditor.html';
import { escapeMarkdownLinkText } from './RichTextEditor.content';

export type GalleryDialogState = {
  images: Array<{ alt: string; caption: string; url: string }>;
  target: HTMLElement | null;
  title: string;
};

type MediaActionOptions = {
  activeGalleryResizeRef: RefObject<ActiveGalleryResize | null>;
  activeRichImageResizeRef: RefObject<ActiveRichImageResize | null>;
  closePopover: () => void;
  currentValueRef: RefObject<RichTextEditorValue>;
  editorRef: RefObject<HTMLDivElement | null>;
  editorShellRef: RefObject<HTMLElement | null>;
  galleryDialogState: GalleryDialogState | null;
  insertSourceBlock: (block: string) => void;
  isHtmlMode: boolean;
  isMarkdownMode: boolean;
  pastedImage: PastedImageState | null;
  replaceSourceSelection: (replacement: string) => void;
  restoreRichSelection: () => void;
  saveSelection: () => void;
  selectedRichImageRef: RefObject<HTMLImageElement | null>;
  setActivePopover: Dispatch<SetStateAction<import('./RichTextEditor.types').EditorPopover>>;
  setGalleryDialogState: Dispatch<SetStateAction<GalleryDialogState | null>>;
  setImageFileError: Dispatch<SetStateAction<string>>;
  setIsCheckingImageFile: Dispatch<SetStateAction<boolean>>;
  setIsColorPickerOpen: Dispatch<SetStateAction<boolean>>;
  setPastedImage: Dispatch<SetStateAction<PastedImageState | null>>;
  setRichImageResizeHandle: Dispatch<SetStateAction<RichImageResizeHandle | null>>;
  updateContent: (content: string) => void;
};

export function createRichTextEditorMediaActions({
  activeGalleryResizeRef,
  activeRichImageResizeRef,
  closePopover,
  currentValueRef,
  editorRef,
  editorShellRef,
  galleryDialogState,
  insertSourceBlock,
  isHtmlMode,
  isMarkdownMode,
  pastedImage,
  replaceSourceSelection,
  restoreRichSelection,
  saveSelection,
  selectedRichImageRef,
  setActivePopover,
  setGalleryDialogState,
  setImageFileError,
  setIsCheckingImageFile,
  setIsColorPickerOpen,
  setPastedImage,
  setRichImageResizeHandle,
  updateContent,
}: MediaActionOptions) {
  const clearRichImageSelection = () => {
    selectedRichImageRef.current = null;
    activeRichImageResizeRef.current = null;
    setRichImageResizeHandle(null);
  };

  const updateRichImageResizeHandle = () => {
    const editorShell = editorShellRef.current;
    const editor = editorRef.current;
    const image = selectedRichImageRef.current;

    if (!editorShell || !editor || !image || !editor.contains(image)) {
      clearRichImageSelection();
      return;
    }

    const shellBounds = editorShell.getBoundingClientRect();
    const imageBounds = image.getBoundingClientRect();

    if (imageBounds.width <= 0 || imageBounds.height <= 0) {
      clearRichImageSelection();
      return;
    }

    setRichImageResizeHandle({
      left: imageBounds.right - shellBounds.left,
      top: imageBounds.bottom - shellBounds.top,
    });
  };

  const selectRichImage = (image: HTMLImageElement) => {
    selectedRichImageRef.current = image;
    window.requestAnimationFrame(updateRichImageResizeHandle);
  };

  const handleRichEditorClick = (event: MouseEvent<HTMLDivElement>) => {
    const galleryToEdit = getEditorGalleryEditTarget(event.target);
    if (galleryToEdit) {
      event.preventDefault();
      openEditorGalleryForEditing(galleryToEdit);
      clearRichImageSelection();
      return;
    }

    const galleryAction = getEditorGalleryAction(event.target);
    if (galleryAction) {
      event.preventDefault();
      moveEditorGallery(event.target as Element, galleryAction);
      clearRichImageSelection();
      return;
    }

    if (event.target instanceof HTMLImageElement) {
      if (event.target.closest('.capubbs-gallery')) {
        clearRichImageSelection();
        return;
      }

      selectRichImage(event.target);
      return;
    }

    clearRichImageSelection();
  };

  const handleGalleryResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = getEditorGalleryResizeTarget(event.target);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();
    target.resizeControl.setPointerCapture(event.pointerId);
    const stage = target.gallery.querySelector<HTMLElement>('.capubbs-gallery-stage');
    const startHeight = getEditorGalleryImageHeight(target.gallery)
      ?? stage?.getBoundingClientRect().height
      ?? galleryResizeMinHeight;

    activeGalleryResizeRef.current = {
      ...target,
      maxHeight: galleryResizeMaxHeight,
      minHeight: galleryResizeMinHeight,
      pointerId: event.pointerId,
      startHeight,
      startY: event.clientY,
    };
    applyGalleryImageHeight(target.gallery, target.resizeControl, startHeight);
    clearRichImageSelection();
  };

  const handleGalleryResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const resize = activeGalleryResizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;

    event.preventDefault();
    const nextHeight = clampImageDimension(
      resize.startHeight + event.clientY - resize.startY,
      resize.minHeight,
      resize.maxHeight,
    );
    applyGalleryImageHeight(resize.gallery, resize.resizeControl, nextHeight);
  };

  const finishGalleryResize = (event: PointerEvent<HTMLDivElement>) => {
    const resize = activeGalleryResizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;

    if (resize.resizeControl.hasPointerCapture(event.pointerId)) {
      resize.resizeControl.releasePointerCapture(event.pointerId);
    }
    activeGalleryResizeRef.current = null;
    updateContent(editorRef.current?.innerHTML ?? '');
  };

  const handleRichImageResizePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const image = selectedRichImageRef.current;
    const editor = editorRef.current;

    if (!image || !editor) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    applyImageIntrinsicDimensions(image, {
      height: image.naturalHeight,
      width: image.naturalWidth,
    });
    event.currentTarget.setPointerCapture(event.pointerId);

    const imageBounds = image.getBoundingClientRect();
    const contentWidth = getEditorContentWidth(editor);

    activeRichImageResizeRef.current = {
      contentWidth,
      image,
      minWidthPercentage: Math.min(100, richImageResizeMinWidth / contentWidth * 100),
      pointerId: event.pointerId,
      startWidthPercentage: getImageWidthPercentage(imageBounds.width, contentWidth),
      startX: event.clientX,
    };
  };

  const handleRichImageResizePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const resizeState = activeRichImageResizeRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const nextWidthPercentage = getResizedImageWidthPercentage(
      resizeState.startWidthPercentage,
      event.clientX - resizeState.startX,
      resizeState.contentWidth,
      resizeState.minWidthPercentage,
    );

    applyImageWidthPercentage(resizeState.image, nextWidthPercentage);
    updateRichImageResizeHandle();
  };

  const finishRichImageResize = (event: PointerEvent<HTMLButtonElement>) => {
    const resizeState = activeRichImageResizeRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeRichImageResizeRef.current = null;
    updateContent(editorRef.current?.innerHTML ?? '');
    updateRichImageResizeHandle();
  };

  const insertRichHtml = (html: string) => {
    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand('insertHTML', false, html);
    updateContent(editorRef.current?.innerHTML ?? '');
  };

  const insertRichImage = (
    url: string,
    altText: string,
    intrinsicDimensions?: ImageIntrinsicDimensions,
  ) => {
    const marker = `capubbs-inserted-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand(
      'insertHTML',
      false,
      `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(altText)}" data-capubbs-image-marker="${marker}">`,
    );

    const image = editorRef.current?.querySelector<HTMLImageElement>(`img[data-capubbs-image-marker="${marker}"]`);
    image?.removeAttribute('data-capubbs-image-marker');
    updateContent(editorRef.current?.innerHTML ?? '');

    if (image) {
      selectRichImage(image);
      applyImageWidthPercentage(image, 100);

      const persistIntrinsicDimensions = () => {
        const editor = editorRef.current;
        if (!editor || !editor.contains(image)) return false;
        const dimensions = intrinsicDimensions ?? {
          height: image.naturalHeight,
          width: image.naturalWidth,
        };
        if (!applyImageIntrinsicDimensions(image, dimensions)) return false;
        updateContent(editor.innerHTML);
        updateRichImageResizeHandle();
        return true;
      };

      if (persistIntrinsicDimensions()) return Promise.resolve();

      return new Promise<void>((resolve) => {
        let settled = false;
        let timeoutId: number | undefined;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (typeof timeoutId !== 'undefined') window.clearTimeout(timeoutId);
          image.removeEventListener('load', handleImageLoad);
          image.removeEventListener('error', finish);
          resolve();
        };
        const handleImageLoad = () => {
          persistIntrinsicDimensions();
          finish();
        };

        image.addEventListener('load', handleImageLoad, { once: true });
        image.addEventListener('error', finish, { once: true });
        timeoutId = window.setTimeout(finish, 5000);
        updateContent(editorRef.current?.innerHTML ?? '');
        updateRichImageResizeHandle();
        if (image.complete) window.requestAnimationFrame(handleImageLoad);
      });
    }

    return Promise.resolve();
  };

  const openGalleryDialog = () => {
    saveSelection();
    setActivePopover(null);
    setIsColorPickerOpen(false);
    setGalleryDialogState({ images: [], target: null, title: '' });
  };

  const openEditorGalleryForEditing = (gallery: HTMLElement) => {
    const snapshot = readEditorGallery(gallery);
    if (snapshot.images.length === 0) return;

    setActivePopover(null);
    setIsColorPickerOpen(false);
    setGalleryDialogState({ ...snapshot, target: gallery });
  };

  const uploadAndInsertGallery = async (
    title: string,
    images: GalleryDialogImage[],
    onProgress: (progress: GalleryUploadProgress) => void,
  ) => {
    const uploadedImages: EditorGalleryImage[] = [];
    const uploadImages = images.filter((image) => Boolean(image.file));
    const totalBytes = uploadImages.reduce((sum, image) => sum + (image.file?.size ?? 0), 0);
    let completedBytes = 0;
    let completedImages = 0;

    for (const image of images) {
      if (!image.file && image.url) {
        uploadedImages.push({
          alt: image.alt,
          caption: image.caption,
          url: image.url,
        });
        continue;
      }

      if (!image.file) {
        throw new Error('图廊图片无效，请移除后重新添加。');
      }

      if (image.file.size > maxInlineImageBytes) {
        throw new Error('图片仍在处理，请稍后再试。');
      }

      const currentImage = completedImages + 1;
      const reportProgress = (fileProgress: number) => {
        const uploadedBytes = completedBytes + (image.file?.size ?? 0) * fileProgress;
        onProgress({
          current: currentImage,
          percent: totalBytes > 0 ? Math.min(100, Math.round((uploadedBytes / totalBytes) * 100)) : 100,
          total: uploadImages.length,
        });
      };
      reportProgress(0);
      const md5 = await getImageFileMd5Hex(image.file);
      const { url } = await uploadEditorImage(image.file, md5, reportProgress);
      completedBytes += image.file.size;
      completedImages += 1;

      uploadedImages.push({
        alt: image.alt || getImageAltText(image.file),
        caption: image.caption,
        url,
      });
    }
    const editedGallery = galleryDialogState?.target;
    const galleryHtml = buildEditorGalleryHtml(
      title,
      uploadedImages,
      editedGallery ? getEditorGalleryImageHeight(editedGallery) : undefined,
    );
    const editorMode = currentValueRef.current.mode;

    if (editedGallery && editorRef.current?.contains(editedGallery)) {
      editedGallery.insertAdjacentHTML('afterend', galleryHtml);
      editedGallery.remove();
      updateContent(editorRef.current.innerHTML);
    } else if (editorMode === 'markdown' || editorMode === 'html') {
      insertSourceBlock(galleryHtml);
    } else {
      insertRichHtml(`${galleryHtml}<p><br></p>`);
    }

    setGalleryDialogState(null);
  };

  const openPastedImageDialog = (file: File, source: PastedImageState['source']) => {
    setPastedImage({
      isCompressing: false,
      isUploading: false,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      source,
      workingFile: file,
    });
  };

  const closePastedImageDialog = () => {
    setPastedImage(null);
  };

  const handleEditorPaste = (event: ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    const imageFile = getClipboardImageFile(event.clipboardData);

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    saveSelection();
    setActivePopover(null);
    setIsColorPickerOpen(false);
    openPastedImageDialog(imageFile, 'paste');
  };

  const handleLocalImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    setImageFileError('');
    setIsCheckingImageFile(true);

    try {
      await validateEditorImageFile(file);
      closePopover();
      openPastedImageDialog(file, 'file');
    } catch (error) {
      setImageFileError(error instanceof Error ? error.message : '图片文件检查失败，请重新选择。');
    } finally {
      setIsCheckingImageFile(false);
    }
  };

  const compressPastedImage = async () => {
    if (!pastedImage || pastedImage.isCompressing) {
      return;
    }

    setPastedImage((current) =>
      current
        ? {
            ...current,
            error: undefined,
            isCompressing: true,
            isUploading: false,
          }
        : current,
    );

    try {
      const compressedFile = await compressImageFileUnderLimit(pastedImage.originalFile, maxInlineImageBytes);

      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: undefined,
              isCompressing: false,
              previewUrl: URL.createObjectURL(compressedFile),
              workingFile: compressedFile,
            }
          : current,
      );
    } catch (error) {
      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: error instanceof Error ? error.message : '图片压缩失败，请换一张图片再试。',
              isCompressing: false,
            }
          : current,
      );
    }
  };

  const uploadAndInsertPastedImage = async () => {
    if (
      !pastedImage ||
      pastedImage.isCompressing ||
      pastedImage.isUploading ||
      pastedImage.workingFile.size > maxInlineImageBytes
    ) {
      return;
    }

    setPastedImage((current) =>
      current
        ? {
            ...current,
            error: undefined,
            isUploading: true,
          }
        : current,
    );

    try {
      const uploadFile = await createUploadableImageFileUnderLimit(pastedImage.workingFile, maxInlineImageBytes);
      const intrinsicDimensions = await getImageFileDimensions(uploadFile);
      const md5 = await getImageFileMd5Hex(uploadFile);
      const { url } = await uploadEditorImage(uploadFile, md5);
      const altText = getImageAltText(pastedImage.originalFile);

      if (isMarkdownMode) {
        replaceSourceSelection(
          `![${escapeMarkdownLinkText(altText)}](${url}){width=${intrinsicDimensions.width}px height=${intrinsicDimensions.height}px}`,
        );
      } else if (isHtmlMode) {
        replaceSourceSelection(
          `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(altText)}" width="${intrinsicDimensions.width}" height="${intrinsicDimensions.height}" style="width: 100%; height: auto;">`,
        );
      } else {
        await insertRichImage(url, altText, intrinsicDimensions);
      }

      closePastedImageDialog();
    } catch (error) {
      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: error instanceof Error ? error.message : '图片上传失败，请稍后重试。',
              isUploading: false,
            }
          : current,
      );
    }
  };


  return {
    clearRichImageSelection,
    closePastedImageDialog,
    compressPastedImage,
    finishGalleryResize,
    finishRichImageResize,
    handleEditorPaste,
    handleGalleryResizePointerDown,
    handleGalleryResizePointerMove,
    handleLocalImageFileChange,
    handleRichEditorClick,
    handleRichImageResizePointerDown,
    handleRichImageResizePointerMove,
    insertRichHtml,
    insertRichImage,
    openGalleryDialog,
    openEditorGalleryForEditing,
    selectRichImage,
    updateRichImageResizeHandle,
    uploadAndInsertGallery,
    uploadAndInsertPastedImage,
  };
}
