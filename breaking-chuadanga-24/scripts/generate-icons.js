import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard Brand SVG (for browser tabs and SVG icon link)
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle inner border -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="#ffffff" stroke-width="6" stroke-opacity="0.25" />

  <!-- Circular emblem plate -->
  <circle cx="256" cy="256" r="190" fill="#7f1d1d" fill-opacity="0.45" stroke="#ffffff" stroke-width="4" stroke-opacity="0.3" filter="url(#shadow)" />

  <!-- Top Brand Tag -->
  <rect x="146" y="105" width="220" height="42" rx="21" fill="#ffffff" />
  <text x="256" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#dc2626" letter-spacing="3" text-anchor="middle">BREAKING</text>

  <!-- Main 24 in Bengali -->
  <text x="256" y="318" font-family="'Hind Siliguri', 'Noto Serif Bengali', -apple-system, sans-serif" font-size="185" font-weight="900" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">২৪</text>

  <!-- Live Pulse Dot -->
  <circle cx="372" cy="180" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="3" />

  <!-- Bottom Location Banner -->
  <rect x="116" y="360" width="280" height="48" rx="24" fill="url(#goldGrad)" filter="url(#shadow)" />
  <text x="256" y="393" font-family="'Hind Siliguri', 'Noto Serif Bengali', -apple-system, sans-serif" font-size="24" font-weight="800" fill="#78350f" text-anchor="middle">চুয়াডাঙ্গা</text>
</svg>`;

// 2. Maskable SVG (Safe-zone 80% circle for Android adaptive icons)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="goldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <!-- Full Bleed Background for adaptive clipping -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Safe Zone content strictly inside central 75% -->
  <g transform="translate(0, 0)">
    <!-- Inner emblem -->
    <circle cx="256" cy="256" r="155" fill="#7f1d1d" fill-opacity="0.5" stroke="#ffffff" stroke-width="4" stroke-opacity="0.4" />

    <!-- Top Brand Tag -->
    <rect x="166" y="132" width="180" height="36" rx="18" fill="#ffffff" />
    <text x="256" y="156" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#dc2626" letter-spacing="2.5" text-anchor="middle">BREAKING</text>

    <!-- Main 24 in Bengali -->
    <text x="256" y="308" font-family="'Hind Siliguri', 'Noto Serif Bengali', -apple-system, sans-serif" font-size="145" font-weight="900" fill="#ffffff" text-anchor="middle">২৪</text>

    <!-- Live indicator -->
    <circle cx="350" cy="195" r="10" fill="#fbbf24" stroke="#ffffff" stroke-width="2.5" />

    <!-- Bottom Banner -->
    <rect x="146" y="342" width="220" height="40" rx="20" fill="url(#goldGradMask)" />
    <text x="256" y="369" font-family="'Hind Siliguri', 'Noto Serif Bengali', -apple-system, sans-serif" font-size="20" font-weight="800" fill="#78350f" text-anchor="middle">চুয়াডাঙ্গা</text>
  </g>
</svg>`;

async function run() {
  console.log('Generating PWA icons...');
  
  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'maskable-icon.svg'), maskableSvg, 'utf-8');
  console.log('SVGs written');

  const brandBuffer = Buffer.from(brandSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192 PNG (Android standard)
  await sharp(brandBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 PNG (Android & splash screens)
  await sharp(brandBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 180x180 PNG (Apple Touch Icon for iOS Safari)
  await sharp(brandBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable 512x512 PNG (Adaptive Android icons)
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Favicon PNG 64x64
  await sharp(brandBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All icons generated successfully in /public!');
}

run().catch(console.error);
