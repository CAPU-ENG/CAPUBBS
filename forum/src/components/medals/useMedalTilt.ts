import { useEffect, type RefObject } from 'react';

type Spring = {
  axes: string[];
  current: Record<string, number>;
  target: Record<string, number>;
  velocity: Record<string, number>;
};

type DeviceOrientationConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'denied' | 'granted'>;
};

type OrientationAxes = {
  horizontal: number;
  vertical: number;
};

let motionPermissionRequested = false;

export function requestMedalMotionPermission() {
  if (
    motionPermissionRequested
    || typeof window === 'undefined'
    || !window.isSecureContext
    || !window.matchMedia('(any-pointer: coarse)').matches
    || typeof DeviceOrientationEvent === 'undefined'
  ) return;

  const orientationEvent = DeviceOrientationEvent as DeviceOrientationConstructorWithPermission;
  if (typeof orientationEvent.requestPermission !== 'function') return;
  motionPermissionRequested = true;
  try {
    void orientationEvent.requestPermission().catch(() => undefined);
  } catch {
    // The lightbox remains usable when the browser rejects sensor access synchronously.
  }
}

export function useMedalTilt(
  cardRef: RefObject<HTMLElement | null>,
  rotatorRef: RefObject<HTMLElement | null>,
  introReady = false,
) {
  useEffect(() => {
    const card = cardRef.current;
    const rotator = rotatorRef.current;
    if (!card || !rotator) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const activeCard = card;
    const activeRotator = rotator;

    const rotationSpring = createSpring({ x: 0, y: 0 });
    const backgroundSpring = createSpring({ x: 50, y: 50 });
    const pointerSpring = createSpring({ effectIntensity: 0, x: 50, y: 50 });
    const springs = [rotationSpring, backgroundSpring, pointerSpring];
    const interactSettings = { damping: 0.25, stiffness: 0.066 };
    const introReturnSettings = { damping: 0.16, stiffness: 0.035 };
    const returnSettings = { damping: 0.06, stiffness: 0.01 };
    let settings = interactSettings;
    let frameId: number | null = null;
    let lastTimestamp = 0;
    let resetTimer: number | null = null;
    let introActive = false;
    const introTimers: number[] = [];
    let orientationBaseline: OrientationAxes | null = null;

    function applyVisualState() {
      const pointerX = round(pointerSpring.current.x);
      const pointerY = round(pointerSpring.current.y);
      const pointerDistance = round(clamp(Math.hypot(pointerX - 50, pointerY - 50) / 50, 0, 1));
      activeRotator.style.setProperty('--medal-tilt-x', `${round(rotationSpring.current.x)}deg`);
      activeRotator.style.setProperty('--medal-tilt-y', `${round(rotationSpring.current.y)}deg`);
      activeRotator.style.setProperty('--medal-background-x', `${round(backgroundSpring.current.x)}%`);
      activeRotator.style.setProperty('--medal-background-y', `${round(backgroundSpring.current.y)}%`);
      activeRotator.style.setProperty('--medal-pointer-x', `${pointerX}%`);
      activeRotator.style.setProperty('--medal-pointer-y', `${pointerY}%`);
      activeRotator.style.setProperty('--medal-pointer-distance', `${pointerDistance}`);
      activeRotator.style.setProperty('--medal-effect-intensity', `${round(pointerSpring.current.effectIntensity)}`);
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
      cancelIntro();
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = null;
      const rect = activeCard.getBoundingClientRect();
      const pointerX = round(clamp(((event.clientX - rect.left) / rect.width) * 100));
      const pointerY = round(clamp(((event.clientY - rect.top) / rect.height) * 100));

      setInteractionTarget(pointerX, pointerY);
    }

    function setInteractionTarget(pointerX: number, pointerY: number) {
      settings = interactSettings;

      setSpringTarget(rotationSpring, { x: -((pointerX - 50) / 3.5), y: (pointerY - 50) / 3.5 });
      setSpringTarget(backgroundSpring, {
        x: mapRange(pointerX, 0, 100, 37, 63),
        y: mapRange(pointerY, 0, 100, 33, 67),
      });
      setSpringTarget(pointerSpring, { effectIntensity: 1, x: pointerX, y: pointerY });
      startAnimation();
    }

    function setRestTarget(nextSettings = returnSettings) {
      settings = nextSettings;
      setSpringTarget(rotationSpring, { x: 0, y: 0 });
      setSpringTarget(backgroundSpring, { x: 50, y: 50 });
      setSpringTarget(pointerSpring, { effectIntensity: 0, x: 50, y: 50 });
      startAnimation();
    }

    function cancelIntro() {
      if (!introActive && introTimers.length === 0) return;
      introActive = false;
      introTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
    }

    function startIntro() {
      introActive = true;
      const horizontalDirection = Math.random() < 0.5 ? -1 : 1;
      const verticalDirection = Math.random() < 0.5 ? -1 : 1;
      const firstTarget = {
        x: 50 + horizontalDirection * randomBetween(16, 24),
        y: 50 + verticalDirection * randomBetween(9, 17),
      };
      const secondTarget = {
        x: 50 - horizontalDirection * randomBetween(12, 20),
        y: 50 - verticalDirection * randomBetween(8, 15),
      };

      introTimers.push(
        window.setTimeout(() => setInteractionTarget(firstTarget.x, firstTarget.y), 140),
        window.setTimeout(() => setInteractionTarget(secondTarget.x, secondTarget.y), 410),
        window.setTimeout(() => {
          introActive = false;
          setRestTarget(introReturnSettings);
        }, 720),
      );
    }

    function handleDeviceOrientation(event: DeviceOrientationEvent) {
      if (event.beta === null || event.gamma === null) return;
      if (introActive) return;
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = null;
      const axes = deviceOrientationAxes(event.beta, event.gamma);
      if (!orientationBaseline) {
        orientationBaseline = axes;
        return;
      }

      const horizontalDelta = applyDeadZone(angleDelta(axes.horizontal, orientationBaseline.horizontal), 1.25);
      const verticalDelta = applyDeadZone(angleDelta(axes.vertical, orientationBaseline.vertical), 1.25);
      const pointerX = round(50 + clamp(horizontalDelta * 1.8, -42, 42));
      const pointerY = round(50 + clamp(verticalDelta * 1.45, -42, 42));
      setInteractionTarget(pointerX, pointerY);
    }

    function handleScreenOrientationChange() {
      cancelIntro();
      orientationBaseline = null;
      handlePointerLeave();
    }

    function handlePointerLeave() {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        setRestTarget();
        resetTimer = null;
      }, 500);
    }

    if (introReady) startIntro();

    activeCard.addEventListener('pointermove', handlePointerMove);
    activeCard.addEventListener('pointerleave', handlePointerLeave);
    activeCard.addEventListener('pointercancel', handlePointerLeave);
    const deviceOrientationEnabled = window.isSecureContext
      && window.matchMedia('(any-pointer: coarse)').matches
      && typeof DeviceOrientationEvent !== 'undefined';
    if (deviceOrientationEnabled) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      window.addEventListener('orientationchange', handleScreenOrientationChange);
    }
    return () => {
      activeCard.removeEventListener('pointermove', handlePointerMove);
      activeCard.removeEventListener('pointerleave', handlePointerLeave);
      activeCard.removeEventListener('pointercancel', handlePointerLeave);
      if (deviceOrientationEnabled) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        window.removeEventListener('orientationchange', handleScreenOrientationChange);
      }
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      cancelIntro();
    };
  }, [cardRef, introReady, rotatorRef]);
}

function deviceOrientationAxes(beta: number, gamma: number): OrientationAxes {
  const orientation = normalizedScreenOrientation();
  if (orientation === 90) return { horizontal: beta, vertical: -gamma };
  if (orientation === 180) return { horizontal: -gamma, vertical: -beta };
  if (orientation === 270) return { horizontal: -beta, vertical: gamma };
  return { horizontal: gamma, vertical: beta };
}

function normalizedScreenOrientation() {
  const legacyOrientation = (window as Window & { orientation?: number }).orientation;
  const angle = window.screen.orientation?.angle ?? legacyOrientation ?? 0;
  return ((angle % 360) + 360) % 360;
}

function angleDelta(value: number, baseline: number) {
  return ((value - baseline + 540) % 360) - 180;
}

function applyDeadZone(value: number, deadZone: number) {
  if (Math.abs(value) <= deadZone) return 0;
  return Math.sign(value) * (Math.abs(value) - deadZone);
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

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
