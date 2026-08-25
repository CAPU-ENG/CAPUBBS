import { Bike } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';

type MedalMaterial = 'gold' | 'holographic' | 'silver';
type MedalRole = 'captain' | 'participant';

const MATERIALS: Array<{ id: MedalMaterial; label: string }> = [
  { id: 'gold', label: '金色' },
  { id: 'silver', label: '银色' },
  { id: 'holographic', label: '镭射' },
];

const ROLES: Array<{ id: MedalRole; label: string }> = [
  { id: 'participant', label: '参与' },
  { id: 'captain', label: '队长' },
];

type MedalStyle = CSSProperties & Record<`--${string}`, string>;

export function MedalDemoPage() {
  const interactionRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [material, setMaterial] = useState<MedalMaterial>('gold');
  const [role, setRole] = useState<MedalRole>('participant');
  const [depth, setDepth] = useState(8);

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const interaction = interactionRef.current;
    if (!interaction) return;
    writeMedalPosition(interaction, pointerRef.current.x, pointerRef.current.y, depth);
  }, [depth]);

  function schedulePointerPosition(element: HTMLDivElement, x: number, y: number) {
    pointerRef.current = { x, y };
    element.dataset.interacting = 'true';
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      writeMedalPosition(element, x, y, depth);
      frameRef.current = null;
    });
  }

  function updateFromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1);
    const y = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1);
    schedulePointerPosition(event.currentTarget, x, y);
  }

  function resetPosition(element: HTMLDivElement) {
    pointerRef.current = { x: 0, y: 0 };
    delete element.dataset.interacting;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      writeMedalPosition(element, 0, 0, depth);
      frameRef.current = null;
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (event.pointerType !== 'mouse') resetPosition(event.currentTarget);
  }

  const medalStyle: MedalStyle = {
    '--rest-edge-x': `${depth * -0.5}px`,
    '--rest-edge-y': `${depth * 0.7}px`,
  };

  return (
    <div className="medal-demo-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#medal-demo-title" contextTitle="勋章效果" />

      <main className="medal-demo-shell">
        <h1 id="medal-demo-title">勋章效果</h1>

        <section className="medal-demo-workspace" aria-label="勋章效果预览">
          <div
            className="medal-demo-interaction"
            data-material={material}
            onPointerCancel={(event) => resetPosition(event.currentTarget)}
            onPointerDown={handlePointerDown}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') resetPosition(event.currentTarget);
            }}
            onPointerMove={updateFromPointer}
            onPointerUp={handlePointerUp}
            ref={interactionRef}
            style={medalStyle}
          >
            <div className="medal-demo-stack">
              <span aria-hidden="true" className="medal-demo-shadow" />
              <span aria-hidden="true" className="medal-demo-edge" />

              <div className="medal-demo-face">
                <span aria-hidden="true" className="medal-demo-rim medal-demo-rim-outer" />
                <span aria-hidden="true" className="medal-demo-rim medal-demo-rim-inner" />
                <div className="medal-demo-insignia">
                  <span className="medal-demo-name">CAPUBBS</span>
                  <span aria-hidden="true" className="medal-demo-bike"><Bike strokeWidth={1.7} /></span>
                  <strong>环湖骑行</strong>
                  <span className="medal-demo-role">{role === 'captain' ? '队长' : '参与'}</span>
                  <span className="medal-demo-year">2026</span>
                </div>
                <span aria-hidden="true" className="medal-demo-foil" />
                <span aria-hidden="true" className="medal-demo-glare" />
              </div>
            </div>
          </div>

          <div className="medal-demo-controls">
            <fieldset>
              <legend>材质</legend>
              <div className="medal-demo-segmented">
                {MATERIALS.map((item) => (
                  <button
                    aria-pressed={material === item.id}
                    key={item.id}
                    onClick={() => setMaterial(item.id)}
                    type="button"
                  >
                    <span aria-hidden="true" className={`medal-demo-swatch medal-demo-swatch-${item.id}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>身份</legend>
              <div className="medal-demo-segmented medal-demo-role-options">
                {ROLES.map((item) => (
                  <button
                    aria-pressed={role === item.id}
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="medal-demo-depth-control">
              <span>厚度</span>
              <input
                aria-label="勋章厚度"
                max="14"
                min="3"
                onChange={(event) => setDepth(Number(event.target.value))}
                type="range"
                value={depth}
              />
              <output>{depth}px</output>
            </label>
          </div>
        </section>
      </main>
    </div>
  );
}

function writeMedalPosition(element: HTMLDivElement, x: number, y: number, depth: number) {
  const style = element.style;
  style.setProperty('--pointer-x', `${(x + 1) * 50}%`);
  style.setProperty('--pointer-y', `${(y + 1) * 50}%`);
  style.setProperty('--tilt-x', `${y * -6}deg`);
  style.setProperty('--tilt-y', `${x * 6}deg`);
  style.setProperty('--edge-x', `${depth * (-0.5 - x * 0.28)}px`);
  style.setProperty('--edge-y', `${depth * (0.7 - y * 0.28)}px`);
  style.setProperty('--shadow-x', `${-x * 12 - 5}px`);
  style.setProperty('--shadow-y', `${-y * 9 + 17}px`);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
