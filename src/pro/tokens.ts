import React from 'react';
import {Easing, interpolate, interpolateColors} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const T = {
  ink: '#0b1020', ink2: '#151c30', paper: '#f5f4f8', white: '#ffffff',
  blue: '#1a6df5', blue2: '#338dff', blue3: '#7db8ff',
  green: '#10b981', red: '#ef4444', warm: '#ff6a4d', amber: '#f59e0b',
  gray: '#8b93a7', gray2: '#c9cfdb',
};
export const FONT = "'Inter', sans-serif";

export const smooth = Easing.bezier(0.22, 1, 0.36, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (f: number, from: number, dur: number, e: (t: number) => number = smooth) =>
  interpolate(f, [from, from + dur], [0, 1], {...clampX, easing: e});

export type BgKey = 'dark' | 'dark-problem' | 'light' | 'accent';
export type SceneDef = {key: string; from: number; to: number; bg: BgKey; step: number | null};
export type StepDef = {icon: string; label: string};
export type Timeline = {total: number; steps: StepDef[]; scenes: SceneDef[]};

export const ACCENT: Record<BgKey, string> = {dark: T.blue3, 'dark-problem': T.warm, light: T.blue, accent: '#ffffff'};
export const TEXT: Record<BgKey, string> = {dark: '#ffffff', 'dark-problem': '#ffffff', light: T.ink, accent: '#ffffff'};
export const SUB: Record<BgKey, string> = {dark: '#9aa4bd', 'dark-problem': '#b89fa5', light: '#6b7488', accent: 'rgba(255,255,255,0.82)'};
export const isLight = (k: BgKey) => k === 'light';
export const BgCtx = React.createContext<BgKey>('light');

const PAL: Record<BgKey, {base: string; g1: string; g2: string}> = {
  dark: {base: '#0b1020', g1: 'rgba(26,109,245,0.38)', g2: 'rgba(125,184,255,0.12)'},
  'dark-problem': {base: '#12080d', g1: 'rgba(255,106,77,0.32)', g2: 'rgba(239,68,68,0.14)'},
  light: {base: '#f5f4f8', g1: 'rgba(26,109,245,0.16)', g2: 'rgba(190,160,255,0.24)'},
  accent: {base: '#1a6df5', g1: 'rgba(125,184,255,0.75)', g2: 'rgba(16,185,129,0.35)'},
};
export const bgColors = (f: number, scenes: SceneDef[], total: number) => {
  const pts: number[] = [], base: string[] = [], g1: string[] = [], g2: string[] = [];
  scenes.forEach((s, i) => {
    const a = i === 0 ? 0 : s.from + 6;
    const b = i === scenes.length - 1 ? total : scenes[i + 1].from - 6;
    pts.push(a, Math.max(b, a + 1));
    for (let k = 0; k < 2; k++) { base.push(PAL[s.bg].base); g1.push(PAL[s.bg].g1); g2.push(PAL[s.bg].g2); }
  });
  return {base: interpolateColors(f, pts, base), g1: interpolateColors(f, pts, g1), g2: interpolateColors(f, pts, g2)};
};
export const lightMix = (f: number, scenes: SceneDef[], total: number) => {
  const pts: number[] = [], v: number[] = [];
  scenes.forEach((s, i) => {
    const a = i === 0 ? 0 : s.from + 6;
    const b = i === scenes.length - 1 ? total : scenes[i + 1].from - 6;
    pts.push(a, Math.max(b, a + 1)); v.push(isLight(s.bg) ? 1 : 0, isLight(s.bg) ? 1 : 0);
  });
  return interpolate(f, pts, v, clampX);
};
