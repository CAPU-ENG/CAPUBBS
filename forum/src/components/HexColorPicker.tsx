import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type KeyboardEvent, type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_COLOR = '#000000';
const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

type HsvColor = {
  hue: number;
  saturation: number;
  value: number;
};

type HexColorPanelProps = {
  actionLabel?: string;
  ariaLabel: string;
  onChange: (color: string) => void;
  onCommit?: () => void;
  onInteractionStart?: () => void;
  value: string;
};

type HexColorPickerProps = Omit<HexColorPanelProps, 'actionLabel' | 'onCommit' | 'onInteractionStart'>;

export function isHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value.toUpperCase());
}

export function HexColorPanel({
  actionLabel,
  ariaLabel,
  onChange,
  onCommit,
  onInteractionStart,
  value,
}: HexColorPanelProps) {
  const inputId = useId();
  const paletteRef = useRef<HTMLDivElement>(null);
  const normalizedValue = normalizeHexColor(value);
  const [lastValidColor, setLastValidColor] = useState(normalizedValue ?? DEFAULT_COLOR);
  const parsedColor = hexToHsv(normalizedValue ?? lastValidColor);
  const [hue, setHue] = useState(parsedColor.hue);
  const activeHue = parsedColor.saturation === 0 ? hue : parsedColor.hue;

  useEffect(() => {
    if (!normalizedValue) return;
    setLastValidColor(normalizedValue);
    const nextColor = hexToHsv(normalizedValue);
    if (nextColor.saturation > 0) setHue(nextColor.hue);
  }, [normalizedValue]);

  function updateSaturationAndValue(event: PointerEvent<HTMLDivElement>) {
    const palette = paletteRef.current;
    if (!palette) return;
    const bounds = palette.getBoundingClientRect();
    const saturation = clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 100;
    const nextValue = (1 - clamp((event.clientY - bounds.top) / bounds.height, 0, 1)) * 100;
    onChange(hsvToHex({ hue: activeHue, saturation, value: nextValue }));
  }

  function handlePalettePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSaturationAndValue(event);
  }

  function handlePalettePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateSaturationAndValue(event);
  }

  function handlePaletteKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 5 : 1;
    const nextColor = { ...parsedColor, hue: activeHue };

    if (event.key === 'ArrowLeft') nextColor.saturation = clamp(nextColor.saturation - step, 0, 100);
    else if (event.key === 'ArrowRight') nextColor.saturation = clamp(nextColor.saturation + step, 0, 100);
    else if (event.key === 'ArrowDown') nextColor.value = clamp(nextColor.value - step, 0, 100);
    else if (event.key === 'ArrowUp') nextColor.value = clamp(nextColor.value + step, 0, 100);
    else return;

    event.preventDefault();
    onChange(hsvToHex(nextColor));
  }

  const displayColor = normalizedValue ?? lastValidColor;

  return (
    <div className="hex-color-panel" onPointerDownCapture={onInteractionStart}>
      <div
        aria-label={`${ariaLabel}饱和度和明度`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(parsedColor.value)}
        aria-valuetext={`饱和度 ${Math.round(parsedColor.saturation)}%，明度 ${Math.round(parsedColor.value)}%`}
        className="hex-color-palette"
        onKeyDown={handlePaletteKeyDown}
        onPointerDown={handlePalettePointerDown}
        onPointerMove={handlePalettePointerMove}
        ref={paletteRef}
        role="slider"
        style={{ backgroundColor: `hsl(${activeHue} 100% 50%)` }}
        tabIndex={0}
      >
        <span
          aria-hidden="true"
          className="hex-color-palette-marker"
          style={{
            backgroundColor: displayColor,
            left: `${parsedColor.saturation}%`,
            top: `${100 - parsedColor.value}%`,
          }}
        />
      </div>

      <input
        aria-label={`${ariaLabel}色相`}
        className="hex-color-hue"
        max={360}
        min={0}
        onChange={(event) => {
          const nextHue = Number(event.target.value);
          setHue(nextHue);
          onChange(hsvToHex({ ...parsedColor, hue: nextHue }));
        }}
        type="range"
        value={Math.round(activeHue)}
      />

      <div className="hex-color-entry">
        <span aria-hidden="true" className="hex-color-preview" style={{ backgroundColor: displayColor }} />
        <label className="hex-color-input-label" htmlFor={inputId}>HEX</label>
        <input
          aria-label={`${ariaLabel}十六进制值`}
          className="hex-color-input"
          id={inputId}
          maxLength={7}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          pattern="#[0-9A-Fa-f]{6}"
          placeholder="#000000"
          spellCheck={false}
          value={value}
        />
        {onCommit && actionLabel ? (
          <button className="hex-color-apply" disabled={!isHexColor(value)} onClick={onCommit} type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function HexColorPicker({ ariaLabel, onChange, value }: HexColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedValue = normalizeHexColor(value);
  const [lastValidColor, setLastValidColor] = useState(normalizedValue ?? DEFAULT_COLOR);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerBounds = triggerRef.current.getBoundingClientRect();
    const popoverWidth = popoverRef.current?.offsetWidth ?? 240;
    const popoverHeight = popoverRef.current?.offsetHeight ?? 190;
    const left = clamp(triggerBounds.left, 8, Math.max(8, window.innerWidth - popoverWidth - 8));
    const fitsBelow = triggerBounds.bottom + 6 + popoverHeight <= window.innerHeight - 8;
    const top = fitsBelow
      ? triggerBounds.bottom + 6
      : Math.max(8, triggerBounds.top - popoverHeight - 6);
    setPosition({ left, top });
  }, []);

  useEffect(() => {
    if (normalizedValue) setLastValidColor(normalizedValue);
  }, [normalizedValue]);

  useLayoutEffect(() => {
    if (isOpen) updatePopoverPosition();
  }, [isOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: globalThis.PointerEvent) {
      if (
        event.target instanceof Node
        && !rootRef.current?.contains(event.target)
        && !popoverRef.current?.contains(event.target)
      ) setIsOpen(false);
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [isOpen, updatePopoverPosition]);

  return (
    <>
      <div className="hex-color-picker" ref={rootRef}>
        <button
          aria-controls={isOpen ? popoverId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          className="hex-color-trigger"
          onClick={() => setIsOpen((open) => !open)}
          ref={triggerRef}
          type="button"
        >
          <span aria-hidden="true" style={{ backgroundColor: normalizedValue ?? lastValidColor }} />
        </button>
      </div>
      {isOpen ? createPortal(
        <div
          aria-label={ariaLabel}
          className="hex-color-popover"
          id={popoverId}
          ref={popoverRef}
          role="dialog"
          style={position}
        >
          <HexColorPanel ariaLabel={ariaLabel} onChange={onChange} value={value} />
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function normalizeHexColor(value: string) {
  const normalized = value.toUpperCase();
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : null;
}

function hexToHsv(color: string): HsvColor {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;
  let hue = 0;

  if (difference !== 0) {
    if (maximum === red) hue = 60 * (((green - blue) / difference) % 6);
    else if (maximum === green) hue = 60 * ((blue - red) / difference + 2);
    else hue = 60 * ((red - green) / difference + 4);
  }

  if (hue < 0) hue += 360;
  return {
    hue,
    saturation: maximum === 0 ? 0 : (difference / maximum) * 100,
    value: maximum * 100,
  };
}

function hsvToHex({ hue, saturation, value }: HsvColor) {
  const chroma = (value / 100) * (saturation / 100);
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const offset = value / 100 - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment < 1) [red, green] = [chroma, secondary];
  else if (segment < 2) [red, green] = [secondary, chroma];
  else if (segment < 3) [green, blue] = [chroma, secondary];
  else if (segment < 4) [green, blue] = [secondary, chroma];
  else if (segment < 5) [red, blue] = [secondary, chroma];
  else [red, blue] = [chroma, secondary];

  return `#${[red, green, blue]
    .map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
