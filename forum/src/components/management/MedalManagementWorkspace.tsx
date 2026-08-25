import { Crop } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import defaultMedalImage from '../../assets/activity/activity.avif';
import carbonTexture from '../../assets/medal-textures/carbon-fiber.jpg';
import geometricTexture from '../../assets/medal-textures/geometric.jpg';
import halftoneTexture from '../../assets/medal-textures/halftone.jpg';
import interlacedTexture from '../../assets/medal-textures/interlaced.jpg';
import pixelTexture from '../../assets/medal-textures/pixel.jpg';
import scaleTexture from '../../assets/medal-textures/scales.jpg';
import swirlTexture from '../../assets/medal-textures/swirl.jpg';
import { AvatarDialog } from '../profile/AvatarEditorDialog';

const OCTAGON_PATH = 'M .310893 0 H .689107 Q .707107 0 .719835 .012728 L .987272 .280165 Q 1 .292893 1 .310893 V .689107 Q 1 .707107 .987272 .719835 L .719835 .987272 Q .707107 1 .689107 1 H .310893 Q .292893 1 .280165 .987272 L .012728 .719835 Q 0 .707107 0 .689107 V .310893 Q 0 .292893 .012728 .280165 L .280165 .012728 Q .292893 0 .310893 0 Z';

const TEXTURES = [
  { id: 'swirl', label: '旋纹', src: swirlTexture },
  { id: 'halftone', label: '网点', src: halftoneTexture },
  { id: 'geometric', label: '几何', src: geometricTexture },
  { id: 'interlaced', label: '交错', src: interlacedTexture },
  { id: 'carbon', label: '碳纤', src: carbonTexture },
  { id: 'scale', label: '鳞片', src: scaleTexture },
  { id: 'pixel', label: '像素', src: pixelTexture },
] as const;

type Spring = {
  axes: string[];
  current: Record<string, number>;
  target: Record<string, number>;
  velocity: Record<string, number>;
};

export function MedalManagementWorkspace() {
  const [medalName, setMedalName] = useState('活动纪念');
  const [imageSource, setImageSource] = useState(defaultMedalImage);
  const [cropOpen, setCropOpen] = useState(false);
  const [textureId, setTextureId] = useState<(typeof TEXTURES)[number]['id']>('swirl');
  const previewRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const selectedTexture = TEXTURES.find((texture) => texture.id === textureId) ?? TEXTURES[0];

  useMedalTilt(previewRef, rotatorRef);

  return (
    <>
      <section className="management-card management-medal-card">
        <header className="management-card-heading">
          <h2>勋章设计</h2>
        </header>

        <div className="management-medal-body">
          <div className="management-medal-controls">
            <label className="management-medal-field">
              <span>勋章名称</span>
              <input
                maxLength={24}
                onChange={(event) => setMedalName(event.target.value)}
                type="text"
                value={medalName}
              />
            </label>

            <div className="management-medal-field">
              <span>图片</span>
              <button className="management-medal-image-button" onClick={() => setCropOpen(true)} type="button">
                <Crop size={15} />
                裁剪图片
              </button>
            </div>

            <fieldset className="management-medal-textures">
              <legend>纹理</legend>
              <div className="management-medal-texture-grid">
                {TEXTURES.map((texture) => (
                  <label className="management-medal-texture" key={texture.id} title={texture.label}>
                    <input
                      checked={texture.id === textureId}
                      name="medal-texture"
                      onChange={() => setTextureId(texture.id)}
                      type="radio"
                      value={texture.id}
                    />
                    <span style={{ backgroundImage: `url(${texture.src})` }} />
                    <small>{texture.label}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <section aria-label="勋章预览" className="management-medal-preview-column">
            <h3>预览</h3>
            <div className="management-medal-preview-stage">
              <svg aria-hidden="true" height="0" width="0">
                <defs>
                  <clipPath clipPathUnits="objectBoundingBox" id="management-medal-rounded-octagon">
                    <path d={OCTAGON_PATH} />
                  </clipPath>
                </defs>
              </svg>
              <div
                aria-label="勋章图案预览"
                className="management-medal-preview"
                ref={previewRef}
                role="img"
              >
                <div
                  className="management-medal-rotator"
                  ref={rotatorRef}
                  style={{ '--medal-foil': `url(${selectedTexture.src})` } as CSSProperties}
                >
                  <div
                    className="management-medal-front"
                    style={{ clipPath: 'url(#management-medal-rounded-octagon)' }}
                  >
                    <img alt="" draggable={false} src={imageSource} />
                    <div aria-hidden="true" className="management-medal-shine" />
                    <div aria-hidden="true" className="management-medal-glare" />
                  </div>
                  <svg
                    aria-hidden="true"
                    className="management-medal-outline"
                    preserveAspectRatio="none"
                    viewBox="0 0 1 1"
                  >
                    <path className="management-medal-outline-shadow" d={OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
                    <path className="management-medal-outline-highlight" d={OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <AvatarDialog
        avatarSrc={imageSource}
        mode="medal"
        onClose={() => setCropOpen(false)}
        onSave={(src) => setImageSource(src)}
        open={cropOpen}
        showDefaultOption={false}
      />
    </>
  );
}

function useMedalTilt(cardRef: RefObject<HTMLDivElement | null>, rotatorRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const card = cardRef.current;
    const rotator = rotatorRef.current;
    if (!card || !rotator) return undefined;

    const rotationSpring = createSpring({ x: 0, y: 0 });
    const backgroundSpring = createSpring({ x: 50, y: 50 });
    const pointerSpring = createSpring({ effectIntensity: 0, x: 50, y: 50 });
    const springs = [rotationSpring, backgroundSpring, pointerSpring];
    const interactSettings = { damping: 0.25, stiffness: 0.066 };
    const returnSettings = { damping: 0.06, stiffness: 0.01 };
    let settings = interactSettings;
    let frameId: number | null = null;
    let lastTimestamp = 0;
    let resetTimer: number | null = null;

    function applyVisualState() {
      const pointerX = round(pointerSpring.current.x);
      const pointerY = round(pointerSpring.current.y);
      const pointerDistance = round(clamp(Math.hypot(pointerX - 50, pointerY - 50) / 50, 0, 1));
      rotator?.style.setProperty('--medal-tilt-x', `${round(rotationSpring.current.x)}deg`);
      rotator?.style.setProperty('--medal-tilt-y', `${round(rotationSpring.current.y)}deg`);
      rotator?.style.setProperty('--medal-background-x', `${round(backgroundSpring.current.x)}%`);
      rotator?.style.setProperty('--medal-background-y', `${round(backgroundSpring.current.y)}%`);
      rotator?.style.setProperty('--medal-pointer-x', `${pointerX}%`);
      rotator?.style.setProperty('--medal-pointer-y', `${pointerY}%`);
      rotator?.style.setProperty('--medal-pointer-distance', `${pointerDistance}`);
      rotator?.style.setProperty('--medal-effect-intensity', `${round(pointerSpring.current.effectIntensity)}`);
    }

    function animate(timestamp: number) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = Math.min((timestamp - lastTimestamp) / 16.666, 4);
      lastTimestamp = timestamp;
      springs.forEach((spring) => updateSpring(spring, deltaTime, settings));

      if (springs.every(isSpringAtTarget)) {
        springs.forEach(finishSpring);
        applyVisualState();
        frameId = null;
        lastTimestamp = 0;
        return;
      }

      applyVisualState();
      frameId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (frameId === null) frameId = window.requestAnimationFrame(animate);
    }

    function handlePointerMove(event: PointerEvent) {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = null;
      settings = interactSettings;

      const rect = card?.getBoundingClientRect();
      if (!rect) return;
      const pointerX = round(clamp(((event.clientX - rect.left) / rect.width) * 100));
      const pointerY = round(clamp(((event.clientY - rect.top) / rect.height) * 100));
      const centerX = pointerX - 50;
      const centerY = pointerY - 50;

      setSpringTarget(rotationSpring, { x: -(centerX / 3.5), y: centerY / 3.5 });
      setSpringTarget(backgroundSpring, {
        x: mapRange(pointerX, 0, 100, 37, 63),
        y: mapRange(pointerY, 0, 100, 33, 67),
      });
      setSpringTarget(pointerSpring, { effectIntensity: 1, x: pointerX, y: pointerY });
      startAnimation();
    }

    function handlePointerLeave() {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        settings = returnSettings;
        setSpringTarget(rotationSpring, { x: 0, y: 0 });
        setSpringTarget(backgroundSpring, { x: 50, y: 50 });
        setSpringTarget(pointerSpring, { effectIntensity: 0, x: 50, y: 50 });
        resetTimer = null;
        startAnimation();
      }, 500);
    }

    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);
    card.addEventListener('pointercancel', handlePointerLeave);

    return () => {
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerleave', handlePointerLeave);
      card.removeEventListener('pointercancel', handlePointerLeave);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, [cardRef, rotatorRef]);
}

function createSpring(initialValue: Record<string, number>): Spring {
  const axes = Object.keys(initialValue);
  return {
    axes,
    current: { ...initialValue },
    target: { ...initialValue },
    velocity: Object.fromEntries(axes.map((axis) => [axis, 0])),
  };
}

function setSpringTarget(spring: Spring, value: Record<string, number>) {
  Object.assign(spring.target, value);
}

function updateSpring(spring: Spring, deltaTime: number, settings: { damping: number; stiffness: number }) {
  spring.axes.forEach((axis) => {
    const distance = spring.target[axis] - spring.current[axis];
    spring.velocity[axis] += distance * settings.stiffness * deltaTime;
    spring.velocity[axis] *= Math.pow(1 - settings.damping, deltaTime);
    spring.current[axis] += spring.velocity[axis] * deltaTime;
  });
}

function isSpringAtTarget(spring: Spring) {
  return spring.axes.every((axis) => (
    Math.abs(spring.target[axis] - spring.current[axis]) < 0.001
    && Math.abs(spring.velocity[axis]) < 0.001
  ));
}

function finishSpring(spring: Spring) {
  spring.current = { ...spring.target };
  spring.axes.forEach((axis) => {
    spring.velocity[axis] = 0;
  });
}

function mapRange(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
  return round(toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin));
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, precision = 3) {
  return Number(value.toFixed(precision));
}
