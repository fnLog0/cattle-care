#!/usr/bin/env node
// Generate the app icon set from inline SVG, using sharp.
// Run: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'images');

const PRIMARY = '#16A34A';
const PRIMARY_DARK = '#15803D';
const PRIMARY_LIGHT = '#86EFAC';
const WHITE = '#FFFFFF';

// Stylised cow head — front-facing, friendly. Designed for a 1024 viewport
// centered around (512, 512); the bounding box of the cow itself fits
// within a ~700×700 area so it sits well inside Android's adaptive-icon
// safe zone when scaled to a smaller foreground.
function cowSvg({ color = WHITE, accent = PRIMARY_DARK }) {
  return `
  <g transform="translate(512, 540)">
    <!-- left ear -->
    <ellipse cx="-260" cy="-30" rx="90" ry="120" fill="${color}" transform="rotate(-25 -260 -30)"/>
    <ellipse cx="-260" cy="-30" rx="40" ry="70" fill="${accent}" opacity="0.25" transform="rotate(-25 -260 -30)"/>
    <!-- right ear -->
    <ellipse cx="260" cy="-30" rx="90" ry="120" fill="${color}" transform="rotate(25 260 -30)"/>
    <ellipse cx="260" cy="-30" rx="40" ry="70" fill="${accent}" opacity="0.25" transform="rotate(25 260 -30)"/>
    <!-- horns -->
    <path d="M -150 -260 Q -190 -340 -120 -360 Q -100 -300 -130 -240 Z" fill="${color}"/>
    <path d="M 150 -260 Q 190 -340 120 -360 Q 100 -300 130 -240 Z" fill="${color}"/>
    <!-- head (rounded square) -->
    <rect x="-220" y="-200" width="440" height="380" rx="160" ry="160" fill="${color}"/>
    <!-- spots -->
    <ellipse cx="-110" cy="-100" rx="55" ry="40" fill="${accent}" opacity="0.18"/>
    <ellipse cx="140" cy="-140" rx="38" ry="28" fill="${accent}" opacity="0.18"/>
    <!-- snout -->
    <ellipse cx="0" cy="100" rx="180" ry="120" fill="${accent}" opacity="0.20"/>
    <!-- nostrils -->
    <ellipse cx="-55" cy="100" rx="14" ry="20" fill="${accent}"/>
    <ellipse cx="55" cy="100" rx="14" ry="20" fill="${accent}"/>
    <!-- eyes -->
    <circle cx="-95" cy="-20" r="22" fill="${accent}"/>
    <circle cx="95" cy="-20" r="22" fill="${accent}"/>
    <!-- eye highlights -->
    <circle cx="-87" cy="-28" r="8" fill="${color}"/>
    <circle cx="103" cy="-28" r="8" fill="${color}"/>
    <!-- smile -->
    <path d="M -45 165 Q 0 195 45 165" stroke="${accent}" stroke-width="8" stroke-linecap="round" fill="none"/>
  </g>`;
}

// Small leaf accent (Care)
function leafSvg() {
  return `
  <g transform="translate(820, 220)">
    <path
      d="M 0 0 Q 60 -80 140 -40 Q 100 40 0 40 Z"
      fill="${PRIMARY_LIGHT}"
      transform="rotate(-20)"
    />
    <path d="M 0 0 Q 30 -30 100 -20" stroke="${PRIMARY_DARK}" stroke-width="4" fill="none" transform="rotate(-20)"/>
  </g>`;
}

const ICON_FULL_BLEED = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${PRIMARY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${leafSvg()}
  ${cowSvg({ color: WHITE, accent: PRIMARY_DARK })}
</svg>`;

const SPLASH = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${cowSvg({ color: PRIMARY, accent: PRIMARY_DARK })}
</svg>`;

const ANDROID_FOREGROUND = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${cowSvg({ color: WHITE, accent: PRIMARY_DARK })}
</svg>`;

const ANDROID_BACKGROUND = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${PRIMARY}"/>
</svg>`;

const ANDROID_MONOCHROME = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${cowSvg({ color: '#000000', accent: '#000000' })}
</svg>`;

const FAVICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${PRIMARY}"/>
  ${cowSvg({ color: WHITE, accent: PRIMARY_DARK })}
</svg>`;

const targets = [
  { svg: ICON_FULL_BLEED, path: 'icon.png', size: 1024 },
  { svg: SPLASH, path: 'splash-icon.png', size: 1024 },
  { svg: ANDROID_FOREGROUND, path: 'android-icon-foreground.png', size: 1024 },
  { svg: ANDROID_BACKGROUND, path: 'android-icon-background.png', size: 1024 },
  { svg: ANDROID_MONOCHROME, path: 'android-icon-monochrome.png', size: 1024 },
  { svg: FAVICON, path: 'favicon.png', size: 48 },
];

await mkdir(OUT_DIR, { recursive: true });
for (const { svg, path, size } of targets) {
  const out = join(OUT_DIR, path);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`✓ ${path} (${size}×${size})`);
}

// Also save the source SVGs alongside so a designer can edit them later
const svgDir = join(OUT_DIR, 'src');
await mkdir(svgDir, { recursive: true });
await writeFile(join(svgDir, 'icon.svg'), ICON_FULL_BLEED);
await writeFile(join(svgDir, 'splash.svg'), SPLASH);
console.log(`✓ source SVGs → assets/images/src/`);
