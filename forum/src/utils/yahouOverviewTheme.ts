import type { YahouStatus } from '../data/yahouLineage.ts';
import type { Theme } from './theme.ts';

type NodeColors = { fill: string; stroke: string };
export type YahouOverviewPalette = {
  background: string;
  text: string;
  link: string;
  root: NodeColors;
  nodes: Record<YahouStatus, NodeColors>;
};

// Explicit SVG colors keep a downloaded snapshot independent of page CSS.
export const YAHOU_OVERVIEW_PALETTES: Record<Theme, YahouOverviewPalette> = {
  light: {
    background: '#fbfcfa', text: '#25352b', link: '#6d8876',
    root: { fill: '#e9edeb', stroke: '#75867d' },
    nodes: {
      qualified: { fill: '#dfece4', stroke: '#39724e' },
      passed: { fill: '#e4eff8', stroke: '#36779f' },
      pending: { fill: '#f9efd8', stroke: '#a27b37' },
    },
  },
  dark: {
    background: '#111613', text: '#e4ece6', link: '#859d8f',
    root: { fill: '#29382f', stroke: '#839a8c' },
    nodes: {
      qualified: { fill: '#21392b', stroke: '#82be98' },
      passed: { fill: '#1d3346', stroke: '#8ebede' },
      pending: { fill: '#403523', stroke: '#d9b571' },
    },
  },
};
