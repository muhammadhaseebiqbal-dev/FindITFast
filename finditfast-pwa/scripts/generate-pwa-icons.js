// Simple script to create placeholder PWA icons
// In a real project, you would use proper image generation tools

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6"/>
  <circle cx="${size * 0.4}" cy="${size * 0.4}" r="${size * 0.15}" fill="none" stroke="white" stroke-width="${size * 0.04}"/>
  <line x1="${size * 0.52}" y1="${size * 0.52}" x2="${size * 0.7}" y2="${size * 0.7}" stroke="white" stroke-width="${size * 0.04}"/>
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial" font-size="${size * 0.06}" fill="white" text-anchor="middle">FindItFast</text>
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons (as placeholders)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), createSVGIcon(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), createSVGIcon(512));

console.log('PWA icon placeholders generated successfully!');
console.log('Note: In production, convert these SVGs to PNG format using proper image tools.');