import { useEffect, type RefObject } from 'react';

type Spring = {
  axes: string[];
  current: Record<string, number>;
  target: Record<string, number>;
  velocity: Record<string, number>;
};

export function useMedalTilt(
  cardRef: RefObject<HTMLElement | null>,
  rotatorRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const card = cardRef.current;
    const rotator = rotatorRef.current;
    if (!card || !rotator) return undefined;
    const activeCard = card;
    const activeRotator = rotator;

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
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = null;
      settings = interactSettings;
      const rect = activeCard.getBoundingClientRect();
      const pointerX = round(clamp(((event.clientX - rect.left) / rect.width) * 100));
      const pointerY = round(clamp(((event.clientY - rect.top) / rect.height) * 100));

      setSpringTarget(rotationSpring, { x: -((pointerX - 50) / 3.5), y: (pointerY - 50) / 3.5 });
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

    activeCard.addEventListener('pointermove', handlePointerMove);
    activeCard.addEventListener('pointerleave', handlePointerLeave);
    activeCard.addEventListener('pointercancel', handlePointerLeave);
    return () => {
      activeCard.removeEventListener('pointermove', handlePointerMove);
      activeCard.removeEventListener('pointerleave', handlePointerLeave);
      activeCard.removeEventListener('pointercancel', handlePointerLeave);
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
