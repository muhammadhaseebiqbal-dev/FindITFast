/**
 * PWA Icon Generator Guide
 * This script helps you create all required PWA icons from your applogo.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 PWA Icon Generation Guide');
console.log('================================');
console.log('');

// Check if applogo.png exists
const logoPath = path.join(__dirname, '../public/applogo.png');
if (fs.existsSync(logoPath)) {
  console.log('✅ applogo.png found in public folder');
} else {
  console.log('❌ applogo.png not found in public folder');
  console.log('Please make sure applogo.png is in the public/ folder before proceeding.');
  process.exit(1);
}

console.log('');
console.log('📋 Required PWA Icons:');
console.log('');

const requiredIcons = [
  { name: 'favicon.ico', size: '16x16, 32x32, 48x48', description: 'Browser favicon (ICO format)' },
  { name: 'pwa-64x64.png', size: '64x64', description: 'Small PWA icon' },
  { name: 'pwa-192x192.png', size: '192x192', description: 'Standard PWA icon' },
  { name: 'pwa-512x512.png', size: '512x512', description: 'Large PWA icon' },
  { name: 'maskable-icon-512x512.png', size: '512x512', description: 'Maskable icon (with safe area)' },
  { name: 'apple-touch-icon.png', size: '180x180', description: 'iOS home screen icon' },
  { name: 'apple-touch-icon-180x180.png', size: '180x180', description: 'iOS home screen icon (specific)' }
];

requiredIcons.forEach((icon, index) => {
  console.log(`${index + 1}. ${icon.name}`);
  console.log(`   Size: ${icon.size}`);
  console.log(`   Purpose: ${icon.description}`);
  console.log('');
});

console.log('🛠️ OPTION 1 - Online Icon Generator (Recommended):');
console.log('1. Visit: https://realfavicongenerator.net/');
console.log('2. Upload your applogo.png');
console.log('3. Configure settings:');
console.log('   - iOS: Use original logo, no background');
console.log('   - Android: Use original logo, choose theme color');
console.log('   - Windows: Use original logo');
console.log('   - Safari: Use original logo');
console.log('4. Download the generated icons package');
console.log('5. Extract and replace files in public/ folder');
console.log('');

console.log('🛠️ OPTION 2 - Using ImageMagick (Command Line):');
console.log('If you have ImageMagick installed, run these commands:');
console.log('');
console.log('cd public/');
console.log('magick applogo.png -resize 64x64 pwa-64x64.png');
console.log('magick applogo.png -resize 192x192 pwa-192x192.png');
console.log('magick applogo.png -resize 512x512 pwa-512x512.png');
console.log('magick applogo.png -resize 180x180 apple-touch-icon.png');
console.log('magick applogo.png -resize 180x180 apple-touch-icon-180x180.png');
console.log('');
console.log('For maskable icon (with padding):');
console.log('magick applogo.png -resize 410x410 -gravity center -background transparent -extent 512x512 maskable-icon-512x512.png');
console.log('');
console.log('For favicon.ico:');
console.log('magick applogo.png \\( -clone 0 -resize 16x16 \\) \\( -clone 0 -resize 32x32 \\) \\( -clone 0 -resize 48x48 \\) -delete 0 favicon.ico');
console.log('');

console.log('🛠️ OPTION 3 - Manual Resize:');
console.log('1. Open applogo.png in image editor (Photoshop, GIMP, etc.)');
console.log('2. Create new images with exact sizes listed above');
console.log('3. Export as PNG (except favicon.ico)');
console.log('4. Save with exact filenames in public/ folder');
console.log('');

console.log('⚠️ Important Notes:');
console.log('• Keep square aspect ratio (same width and height)');
console.log('• Use transparent background if logo has one');
console.log('• For maskable icons, ensure logo fits in safe area (80% of total size)');
console.log('• Test on different devices after updating');
console.log('');

console.log('📱 After generating icons:');
console.log('1. Clear browser cache');
console.log('2. Uninstall and reinstall PWA');
console.log('3. Icons should now show the new logo');
console.log('');

// Add package.json script
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('💡 Tip: You can run this guide anytime with:');
  console.log('npm run generate-icons');
}