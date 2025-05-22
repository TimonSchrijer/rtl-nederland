const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// RTL brand colors
const RTL_COLORS = {
  darkBlue: "#0975F3",
  lightBlue: "#16B8FE",
  orange: "#FE9726",
};

// Create SVG with RTL logo
const createRTLLogoSVG = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 114 20" width="114" height="20">
  <path fill="${RTL_COLORS.darkBlue}" d="M35.565 0H0v20h35.565z"></path>
  <path fill="#fff" d="M10.103 4.597h9.477c2.888 0 4.492 1.297 4.492 3.474 0 1.867-1.203 3.118-3.256 3.41l4.646 3.922h-3.566l-4.368-3.782h-4.956v3.782h-2.469zm9.154 5.001c1.527 0 2.27-.493 2.27-1.497s-.741-1.483-2.27-1.483h-6.685v2.979z"></path>
  <path fill="${RTL_COLORS.lightBlue}" d="M74.681 0H39.117v20H74.68z"></path>
  <path fill="#fff" d="M55.664 6.727h-6.251v-2.13h14.972v2.13h-6.25v8.676h-2.471z"></path>
  <path fill="${RTL_COLORS.orange}" d="M113.798 0H78.233v20h35.565z"></path>
  <path fill="#fff" d="M89.285 4.597h2.471v8.674h10.99v2.132h-13.46V4.597Z"></path>
</svg>
`;

// Icon sizes to generate
const ICON_SIZES = [16, 32, 48, 64, 128, 192, 256, 384, 512];

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    await fs.mkdir(iconsDir, { recursive: true });

    // Create temporary SVG file
    const svgContent = createRTLLogoSVG();
    const tempSvgPath = path.join(process.cwd(), 'temp-rtl-logo.svg');
    await fs.writeFile(tempSvgPath, svgContent);

    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const padding = Math.floor(size * 0.1); // 10% padding
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(tempSvgPath)
        .resize(size - (padding * 2), size - (padding * 2), {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${size}x${size} icon`);
    }

    // Clean up temporary SVG
    await fs.unlink(tempSvgPath);

    // Copy 32x32 as favicon.png
    await fs.copyFile(
      path.join(iconsDir, 'icon-32x32.png'),
      path.join(process.cwd(), 'public', 'favicon.png')
    );

    console.log('Generated favicon.png');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 