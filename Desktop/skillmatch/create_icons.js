// Node.js script to create icons
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw rounded rectangle background
    const cornerRadius = size * 0.15;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, cornerRadius);
    ctx.fill();
    
    // Draw Zap icon
    const iconSize = size * 0.4;
    const centerX = size / 2;
    const centerY = size / 2;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.02;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Scale and position the zap path
    const scale = iconSize / 24;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    
    // Zap path (simplified)
    ctx.beginPath();
    ctx.moveTo(13, 2);
    ctx.lineTo(3, 14);
    ctx.lineTo(12, 14);
    ctx.lineTo(11, 22);
    ctx.lineTo(21, 10);
    ctx.lineTo(12, 10);
    ctx.lineTo(13, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
}

// Create icons
createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');
createIcon(32, 'favicon-32x32.png');
