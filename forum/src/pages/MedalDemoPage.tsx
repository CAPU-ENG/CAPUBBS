import { Bike } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';

type MedalMaterial = 'gold' | 'holographic' | 'silver';
type MedalRole = 'captain' | 'participant';

const MATERIALS: Array<{ id: MedalMaterial; label: string }> = [
  { id: 'gold', label: '金边' },
  { id: 'silver', label: '银边' },
  { id: 'holographic', label: '闪边' },
];

const ROLES: Array<{ id: MedalRole; label: string }> = [
  { id: 'participant', label: '参与' },
  { id: 'captain', label: '队长' },
];

export function MedalDemoPage() {
  const frameRef = useRef<number | null>(null);
  const [material, setMaterial] = useState<MedalMaterial>('gold');
  const [role, setRole] = useState<MedalRole>('participant');

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  function schedulePointerPosition(element: HTMLDivElement, x: number, y: number) {
    element.dataset.interacting = 'true';
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      writeMedalPosition(element, x, y);
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
    delete element.dataset.interacting;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      writeMedalPosition(element, 0, 0);
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

  const roleLabel = role === 'captain' ? '队长' : '参与';

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
          >
            <div className="medal-demo-stack">
              <span aria-hidden="true" className="medal-demo-shadow" />

              <div
                aria-label={`环湖骑行 2026 ${roleLabel}勋章`}
                className="medal-demo-card"
                role="img"
              >
                <span aria-hidden="true" className="medal-demo-frame-shine" />
                <div className="medal-demo-card-face">
                  <span className="medal-demo-series">CAPUBBS · 2026</span>

                  <header className="medal-demo-card-header">
                    <strong>环湖骑行</strong>
                    <span><b>120</b> KM</span>
                  </header>

                  <div className="medal-demo-artwork">
                    <span aria-hidden="true" className="medal-demo-route" />
                    <span aria-hidden="true" className="medal-demo-bike"><Bike strokeWidth={1.65} /></span>
                    <span className="medal-demo-art-caption">青海湖 · 夏季骑行</span>
                  </div>

                  <div className="medal-demo-experience">
                    <span aria-hidden="true" className="medal-demo-energy"><i /><i /></span>
                    <strong>{roleLabel}</strong>
                    <span>活动经历</span>
                  </div>

                  <div className="medal-demo-card-footer">
                    <span>RIDE · 026</span>
                    <span>2026.08</span>
                  </div>
                </div>

                <span aria-hidden="true" className="medal-demo-foil" />
                <span aria-hidden="true" className="medal-demo-glare" />
              </div>
            </div>
          </div>

          <div className="medal-demo-controls">
            <fieldset>
              <legend>边框</legend>
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
          </div>
        </section>
      </main>
    </div>
  );
}

function writeMedalPosition(element: HTMLDivElement, x: number, y: number) {
  const style = element.style;
  style.setProperty('--pointer-x', `${(x + 1) * 50}%`);
  style.setProperty('--pointer-y', `${(y + 1) * 50}%`);
  style.setProperty('--tilt-x', `${y * -4}deg`);
  style.setProperty('--tilt-y', `${x * 4}deg`);
  style.setProperty('--shadow-x', `${x * -8}px`);
  style.setProperty('--shadow-y', `${y * -5 + 14}px`);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
