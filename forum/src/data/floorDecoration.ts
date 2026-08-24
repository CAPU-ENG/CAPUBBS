import type { Theme } from '../utils/theme';

export type FloorDecorationPaths = {
  darkImagePath: string | null;
  lightImagePath: string | null;
};

export type FloorDecorationVariant = 'light' | 'dark';

export function getFloorDecorationPath(decoration: FloorDecorationPaths | undefined, theme: Theme) {
  if (!decoration) return '';
  return theme === 'dark'
    ? decoration.darkImagePath ?? ''
    : decoration.lightImagePath ?? '';
}
