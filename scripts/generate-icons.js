const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [192, 256, 384, 512];
  const inputSvg = path.join(__dirname, '../public/placeholder-logo.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate icons for each size
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
  }
}

generateIcons().catch(console.error); 