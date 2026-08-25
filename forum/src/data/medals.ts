export type MedalDisplayState = 'display' | 'hidden' | 'retain';

export type MedalTextureId =
  | 'carbon'
  | 'geometric'
  | 'halftone'
  | 'interlaced'
  | 'pixel'
  | 'scale'
  | 'swirl';

export type UserMedal = {
  awardedAt: number;
  id: string;
  largeImagePath?: string;
  name: string;
  role: string;
  smallImagePath: string;
  state?: MedalDisplayState;
  textureId?: MedalTextureId;
};

