import { Check, ImagePlus, RotateCcw, Scissors, Upload, X } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import defaultAvatar from '../../assets/bg/bicycle.svg';

type AvatarDialogProps = {
  avatarSrc: string;
  onClose: () => void;
  onSave: (src: string) => Promise<void> | void;
  open: boolean;
  showDefaultOption?: boolean;
};

type DisplayMetrics = {
  height: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  width: number;
};

type ResizeCorner = 'ne' | 'nw' | 'se' | 'sw';

type CropAreaBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

type DragState = {
  corner?: ResizeCorner;
  kind: 'move' | 'resize';
  pointerId: number;
  startCropSize: number;
  startCropX: number;
  startCropY: number;
  startPointerX: number;
  startPointerY: number;
};

const OUTPUT_SIZE = 320;
const WORKSPACE_SIZE = 360;
const MIN_CROP_SIZE = 64;
const KEYBOARD_MOVE_STEP = 4;
const corners: ResizeCorner[] = ['nw', 'ne', 'sw', 'se'];

export function AvatarDialog({ avatarSrc, onClose, onSave, open, showDefaultOption = true }: AvatarDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceViewportRef = useRef<HTMLDivElement | null>(null);
  const [sourceSrc, setSourceSrc] = useState(avatarSrc);
  const [previewSrc, setPreviewSrc] = useState(avatarSrc);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [isDefaultSelected, setIsDefaultSelected] = useState(avatarSrc === defaultAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceScale, setWorkspaceScale] = useState(1);
  const [cropSize, setCropSize] = useState(WORKSPACE_SIZE);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [imageSize, setImageSize] = useState<{ naturalHeight: number; naturalWidth: number } | null>(null);
  const displayMetrics = useMemo(
    () => imageSize ? getDisplayMetrics(imageSize.naturalWidth, imageSize.naturalHeight) : null,
    [imageSize],
  );
  const cropBounds = displayMetrics ? getCropAreaBounds(displayMetrics) : getWorkspaceAreaBounds();
  const maxCropSize = displayMetrics ? Math.min(displayMetrics.width, displayMetrics.height) : WORKSPACE_SIZE;
  const safeCropSize = clamp(cropSize, Math.min(MIN_CROP_SIZE, maxCropSize), maxCropSize);
  const positionBounds = getCropPositionBounds(cropBounds, safeCropSize);
  const safeCropX = clamp(cropX, positionBounds.minX, positionBounds.maxX);
  const safeCropY = clamp(cropY, positionBounds.minY, positionBounds.maxY);

  useEffect(() => {
    if (!open) return;

    setSourceSrc(avatarSrc);
    setPreviewSrc(avatarSrc);
    setFileName('');
    setStatus('');
    setIsDefaultSelected(showDefaultOption && avatarSrc === defaultAvatar);
    setIsSaving(false);
    setCropSize(WORKSPACE_SIZE);
    setCropX(0);
    setCropY(0);
    setImageSize(null);
    dragStateRef.current = null;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [avatarSrc, onClose, open, showDefaultOption]);

  useEffect(() => {
    if (!open) return;
    const viewport = workspaceViewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const width = viewport.getBoundingClientRect().width;
      setWorkspaceScale(width > 0 ? width / WORKSPACE_SIZE : 1);
    };

    updateScale();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open || !sourceSrc) {
      if (open) setImageSize(null);
      return;
    }
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const nextMetrics = getDisplayMetrics(image.naturalWidth, image.naturalHeight);
      const centeredCrop = getCenteredCrop(nextMetrics);
      setImageSize({ naturalHeight: image.naturalHeight, naturalWidth: image.naturalWidth });
      setCropSize(centeredCrop.size);
      setCropX(centeredCrop.x);
      setCropY(centeredCrop.y);
      setStatus('');
    };
    image.onerror = () => !cancelled && setStatus('图片加载失败');
    image.src = sourceSrc;

    return () => { cancelled = true; };
  }, [open, sourceSrc]);

  useEffect(() => {
    if (!open || !sourceSrc || !displayMetrics) return;
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) {
        setStatus('无法处理当前图片');
        return;
      }

      const cropOnImage = getCropOnImage(displayMetrics, safeCropX, safeCropY, safeCropSize);
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      context.drawImage(
        image,
        cropOnImage.x,
        cropOnImage.y,
        cropOnImage.width,
        cropOnImage.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      try {
        setPreviewSrc(canvas.toDataURL('image/png'));
      } catch {
        setStatus('无法保存当前裁切结果');
      }
    };
    image.onerror = () => !cancelled && setStatus('图片加载失败');
    image.src = sourceSrc;

    return () => { cancelled = true; };
  }, [displayMetrics, open, safeCropSize, safeCropX, safeCropY, sourceSrc]);

  if (!open) return null;

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setStatus('图片读取失败');
        return;
      }
      setSourceSrc(reader.result);
      setFileName(file.name);
      setIsDefaultSelected(false);
      setStatus('');
    };
    reader.onerror = () => setStatus('图片读取失败');
    reader.readAsDataURL(file);
  }

  function useDefaultAvatar() {
    setSourceSrc(defaultAvatar);
    setFileName('');
    setIsDefaultSelected(true);
    setStatus('');
  }

  function resetCrop() {
    const centeredCrop = getCenteredCrop(displayMetrics);
    setCropSize(centeredCrop.size);
    setCropX(centeredCrop.x);
    setCropY(centeredCrop.y);
    dragStateRef.current = null;
  }

  function beginDrag(event: PointerEvent<HTMLElement>, kind: DragState['kind'], corner?: ResizeCorner) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      corner,
      kind,
      pointerId: event.pointerId,
      startCropSize: safeCropSize,
      startCropX: safeCropX,
      startCropY: safeCropY,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
    };
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const deltaX = (event.clientX - dragState.startPointerX) / workspaceScale;
    const deltaY = (event.clientY - dragState.startPointerY) / workspaceScale;

    if (dragState.kind === 'move') {
      setCropX(clamp(dragState.startCropX + deltaX, positionBounds.minX, positionBounds.maxX));
      setCropY(clamp(dragState.startCropY + deltaY, positionBounds.minY, positionBounds.maxY));
      return;
    }

    const resized = getResizedCrop(dragState, deltaX, deltaY, cropBounds);
    setCropSize(resized.size);
    setCropX(resized.x);
    setCropY(resized.y);
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) dragStateRef.current = null;
  }

  function moveCropWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const movements: Partial<Record<string, [number, number]>> = {
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
    };
    const movement = movements[event.key];
    if (!movement) return;
    event.preventDefault();
    const step = event.shiftKey ? 16 : KEYBOARD_MOVE_STEP;
    setCropX(clamp(safeCropX + movement[0] * step, positionBounds.minX, positionBounds.maxX));
    setCropY(clamp(safeCropY + movement[1] * step, positionBounds.minY, positionBounds.maxY));
  }

  async function saveAvatar() {
    const nextAvatar = isDefaultSelected ? defaultAvatar : previewSrc;
    if (!nextAvatar) {
      setStatus('请先完成裁切');
      return;
    }

    try {
      setIsSaving(true);
      setStatus('正在保存头像');
      await onSave(nextAvatar);
      onClose();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '头像保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <div className="profile-dialog-backdrop" role="presentation">
      <button className="profile-dialog-dismiss" type="button" aria-label="关闭头像编辑窗口" onClick={isSaving ? undefined : onClose} />
      <section className="profile-dialog profile-avatar-editor" role="dialog" aria-modal="true" aria-labelledby="avatar-editor-title">
        <header>
          <span><Scissors size={18} /></span>
          <h2 id="avatar-editor-title">加工头像</h2>
          <button aria-label="关闭" disabled={isSaving} type="button" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="profile-avatar-editor-body">
          <div className="profile-avatar-workbench">
            <div ref={workspaceViewportRef} className="profile-avatar-workspace">
              <div className="profile-avatar-workspace-canvas" style={{ height: WORKSPACE_SIZE, transform: `scale(${workspaceScale})`, width: WORKSPACE_SIZE }}>
                {displayMetrics ? (
                  <>
                    <img
                      className="profile-avatar-source"
                      src={sourceSrc}
                      alt=""
                      draggable={false}
                      style={{
                        height: displayMetrics.height,
                        left: displayMetrics.offsetX,
                        top: displayMetrics.offsetY,
                        width: displayMetrics.width,
                      }}
                    />
                    <div className="profile-avatar-crop-shade" />
                    <div
                      className="profile-avatar-crop-box"
                      role="group"
                      tabIndex={0}
                      aria-label="头像裁剪框"
                      onKeyDown={moveCropWithKeyboard}
                      onPointerCancel={endDrag}
                      onPointerDown={(event) => beginDrag(event, 'move')}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      style={{ height: safeCropSize, left: safeCropX, top: safeCropY, width: safeCropSize }}
                    >
                      <div className="profile-avatar-crop-image">
                      <img
                        src={sourceSrc}
                        alt=""
                        draggable={false}
                        style={{
                          height: displayMetrics.height,
                          left: displayMetrics.offsetX - safeCropX,
                          top: displayMetrics.offsetY - safeCropY,
                          width: displayMetrics.width,
                        }}
                      />
                        <i /><i /><i /><i />
                      </div>
                      {corners.map((corner) => (
                        <span
                          aria-hidden="true"
                          data-corner={corner}
                          key={corner}
                          onPointerCancel={endDrag}
                          onPointerDown={(event) => beginDrag(event, 'resize', corner)}
                          onPointerMove={moveDrag}
                          onPointerUp={endDrag}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="profile-avatar-empty-state">
                    <ImagePlus size={28} />
                    <span>请先上传图片</span>
                  </div>
                )}
              </div>
            </div>
            <canvas ref={canvasRef} hidden />
          </div>

          <aside className="profile-avatar-editor-aside">
            <div className="profile-avatar-result">
              {previewSrc ? <img src={previewSrc} alt="头像裁切预览" /> : <div className="profile-avatar-empty-result"><ImagePlus size={22} /><span>上传后预览</span></div>}
            </div>
            <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleUpload} />
            <button type="button" disabled={isSaving} onClick={() => fileInputRef.current?.click()}><Upload size={15} />上传图片</button>
            {showDefaultOption && <button type="button" disabled={isSaving} onClick={useDefaultAvatar}><ImagePlus size={15} />默认头像</button>}
            <button type="button" disabled={isSaving || !sourceSrc} onClick={resetCrop}><RotateCcw size={15} />重置裁切</button>
            <p role="status">{status || fileName || (sourceSrc ? '拖动裁剪框调整位置，拖动四角改变大小。' : '请先上传图片')}</p>
          </aside>
        </div>

        <footer className="profile-dialog-footer">
          <button className="profile-dialog-cancel" type="button" disabled={isSaving} onClick={onClose}>取消</button>
          <button className="profile-dialog-confirm" type="button" disabled={isSaving || !sourceSrc} onClick={saveAvatar}>
            <Check size={14} />{isSaving ? '保存中' : '保存头像'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function getDisplayMetrics(naturalWidth: number, naturalHeight: number): DisplayMetrics {
  const scale = Math.min(WORKSPACE_SIZE / naturalWidth, WORKSPACE_SIZE / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    height,
    offsetX: (WORKSPACE_SIZE - width) / 2,
    offsetY: (WORKSPACE_SIZE - height) / 2,
    scale,
    width,
  };
}

function getCropOnImage(metrics: DisplayMetrics, cropX: number, cropY: number, cropSize: number) {
  return {
    height: cropSize / metrics.scale,
    width: cropSize / metrics.scale,
    x: (cropX - metrics.offsetX) / metrics.scale,
    y: (cropY - metrics.offsetY) / metrics.scale,
  };
}

function getCenteredCrop(metrics: DisplayMetrics | null) {
  if (!metrics) return { size: WORKSPACE_SIZE, x: 0, y: 0 };
  const size = Math.min(metrics.width, metrics.height);
  return {
    size,
    x: metrics.offsetX + (metrics.width - size) / 2,
    y: metrics.offsetY + (metrics.height - size) / 2,
  };
}

function getCropAreaBounds(metrics: DisplayMetrics): CropAreaBounds {
  return {
    maxX: metrics.offsetX + metrics.width,
    maxY: metrics.offsetY + metrics.height,
    minX: metrics.offsetX,
    minY: metrics.offsetY,
  };
}

function getWorkspaceAreaBounds(): CropAreaBounds {
  return { maxX: WORKSPACE_SIZE, maxY: WORKSPACE_SIZE, minX: 0, minY: 0 };
}

function getCropPositionBounds(bounds: CropAreaBounds, cropSize: number) {
  return {
    maxX: bounds.maxX - cropSize,
    maxY: bounds.maxY - cropSize,
    minX: bounds.minX,
    minY: bounds.minY,
  };
}

function getResizedCrop(dragState: DragState, deltaX: number, deltaY: number, bounds: CropAreaBounds) {
  const corner = dragState.corner ?? 'se';
  const horizontalDelta = corner.endsWith('e') ? deltaX : -deltaX;
  const verticalDelta = corner.startsWith('s') ? deltaY : -deltaY;
  const sizeDelta = Math.abs(horizontalDelta) > Math.abs(verticalDelta) ? horizontalDelta : verticalDelta;
  const right = dragState.startCropX + dragState.startCropSize;
  const bottom = dragState.startCropY + dragState.startCropSize;
  const maxSize = getMaxCropSizeForCorner(dragState, corner, bounds);
  const size = clamp(dragState.startCropSize + sizeDelta, Math.min(MIN_CROP_SIZE, maxSize), maxSize);
  return {
    size,
    x: corner.endsWith('e') ? dragState.startCropX : right - size,
    y: corner.startsWith('s') ? dragState.startCropY : bottom - size,
  };
}

function getMaxCropSizeForCorner(dragState: DragState, corner: ResizeCorner, bounds: CropAreaBounds) {
  const right = dragState.startCropX + dragState.startCropSize;
  const bottom = dragState.startCropY + dragState.startCropSize;
  if (corner === 'ne') return Math.min(bounds.maxX - dragState.startCropX, bottom - bounds.minY);
  if (corner === 'nw') return Math.min(right - bounds.minX, bottom - bounds.minY);
  if (corner === 'sw') return Math.min(right - bounds.minX, bounds.maxY - dragState.startCropY);
  return Math.min(bounds.maxX - dragState.startCropX, bounds.maxY - dragState.startCropY);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
