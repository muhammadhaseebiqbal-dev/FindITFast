// Create proper PNG icons using Canvas API in Node.js
import fs from 'fs';
import { createCanvas } from 'canvas';

// Function to create a PNG icon
function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#3B82F6'; // Blue background
  ctx.fillRect(0, 0, size, size);
  
  // Search icon (magnifying glass)
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.08;
  
  // Circle
  ctx.beginPath();
  ctx.arc(size * 0.4, size * 0.4, size * 0.15, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Handle
  ctx.beginPath();
  ctx.moveTo(size * 0.52, size * 0.52);
  ctx.lineTo(size * 0.7, size * 0.7);
  ctx.stroke();
  
  // Text
  ctx.font = `${size * 0.06}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('FindItFast', size * 0.5, size * 0.85);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`✅ Created ${filename} (${size}x${size})`);
}

// Install canvas package first
console.log('📦 Installing canvas package...');
console.log('Run: npm install canvas');
console.log('Then run this script again.');

export { createIcon };