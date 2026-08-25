import carbonTexture from '../../assets/medal-textures/carbon-fiber.jpg';
import geometricTexture from '../../assets/medal-textures/geometric.jpg';
import halftoneTexture from '../../assets/medal-textures/halftone.jpg';
import interlacedTexture from '../../assets/medal-textures/interlaced.jpg';
import pixelTexture from '../../assets/medal-textures/pixel.jpg';
import scaleTexture from '../../assets/medal-textures/scales.jpg';
import swirlTexture from '../../assets/medal-textures/swirl.jpg';

export const MEDAL_OCTAGON_PATH = 'M .310893 0 H .689107 Q .707107 0 .719835 .012728 L .987272 .280165 Q 1 .292893 1 .310893 V .689107 Q 1 .707107 .987272 .719835 L .719835 .987272 Q .707107 1 .689107 1 H .310893 Q .292893 1 .280165 .987272 L .012728 .719835 Q 0 .707107 0 .689107 V .310893 Q 0 .292893 .012728 .280165 L .280165 .012728 Q .292893 0 .310893 0 Z';

export const MEDAL_TEXTURES = [
  { id: 'swirl', label: '旋纹', src: swirlTexture },
  { id: 'halftone', label: '网点', src: halftoneTexture },
  { id: 'geometric', label: '几何', src: geometricTexture },
  { id: 'interlaced', label: '交错', src: interlacedTexture },
  { id: 'carbon', label: '碳纤', src: carbonTexture },
  { id: 'scale', label: '鳞片', src: scaleTexture },
  { id: 'pixel', label: '像素', src: pixelTexture },
] as const;

export type MedalTextureId = (typeof MEDAL_TEXTURES)[number]['id'];

export type MedalDraft = {
  imageSource: string;
  name: string;
  textureId: MedalTextureId;
};
