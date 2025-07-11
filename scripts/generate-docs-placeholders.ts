const fs = require('fs');
const path = require('path');

// List of missing images from the error message
const missingImages = [
  'atomic-commitment.png',
  'architecture-overview.png',
  'network-security.png',
  'job-lifecycle.png'
];

// Create a simple SVG placeholder with text
function createPlaceholderImage(text: string) {
  return `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            text-anchor="middle" 
            dominant-baseline="middle"
            fill="#666">
        Placeholder: ${text}
      </text>
    </svg>
  `;
}

// Ensure the target directory exists
const imgDir = path.join(__dirname, '../../docs-site/static/img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
  console.log(`Created directory: ${imgDir}`);
}

// Generate placeholder images
missingImages.forEach(imgName => {
  const imagePath = path.join(imgDir, imgName);
  const svgContent = createPlaceholderImage(imgName.replace('.png', '').replace(/-/g, ' '));
  fs.writeFileSync(imagePath, svgContent.trim());
  console.log(`Created placeholder: ${imagePath}`);
});

console.log('✅ All placeholder images generated successfully!');
