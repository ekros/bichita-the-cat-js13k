const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs').promises;

async function loadWebpAsImage(filename) {
    // Convert WebP to PNG in memory and load with canvas
    const pngBuffer = await sharp(filename)
        .png()
        .toBuffer();
    return loadImage(pngBuffer);
}

async function createAtlas() {
    // Create a 96x96 canvas (75% of original size)
    const atlasWidth = 96;
    const atlasHeight = 96;
    const spriteSize = 24;
    
    const outputCanvas = createCanvas(atlasWidth, atlasHeight);
    const ctx = outputCanvas.getContext('2d');
    
    // Load all images
    const images = {
        bichitaWalk: await loadWebpAsImage('bichita-walk-1.webp'),
        bichitaPose: await loadWebpAsImage('bichita-posing.webp'),
        whiteWalk: await loadWebpAsImage('black-white-walking.webp'),
        whitePose: await loadWebpAsImage('black-white-posing.webp'),
        tabbyWalk: await loadWebpAsImage('silver-tabby-cat.webp'),
        tabbyPose: await loadWebpAsImage('silver-tabby-posing.webp'),
        orangeWalk: await loadWebpAsImage('orange-cat-walking.webp'),
        orangePose: await loadWebpAsImage('orange-cat-posing.webp')
    };
    
    // Draw images to atlas
    let y = 0;
    
    // Row 1: Bichita (using pose sprite for both pose and drag animations)
    ctx.drawImage(images.bichitaWalk, 0, y, spriteSize, spriteSize);
    ctx.drawImage(images.bichitaPose, spriteSize, y, spriteSize, spriteSize);
    
    // Row 2: White cat
    y += spriteSize;
    ctx.drawImage(images.whiteWalk, 0, y, spriteSize, spriteSize);
    ctx.drawImage(images.whitePose, spriteSize, y, spriteSize, spriteSize);
    
    // Row 3: Tabby cat
    y += spriteSize;
    ctx.drawImage(images.tabbyWalk, 0, y, spriteSize, spriteSize);
    ctx.drawImage(images.tabbyPose, spriteSize, y, spriteSize, spriteSize);
    
    // Row 4: Orange cat
    y += spriteSize;
    ctx.drawImage(images.orangeWalk, 0, y, spriteSize, spriteSize);
    ctx.drawImage(images.orangePose, spriteSize, y, spriteSize, spriteSize);
    
    // Save atlas as PNG first
    const pngBuffer = outputCanvas.toBuffer('image/png');
    console.log('PNG buffer created:', pngBuffer.length, 'bytes');

    try {
        // Convert PNG buffer to WebP
        await sharp(pngBuffer)
            .webp({ quality: 70, lossless: false })
            .toFile('sprites.webp');
        console.log('Atlas saved as sprites.webp');
    } catch (err) {
        console.error('Error saving WebP:', err);
        // Fallback to saving as PNG if WebP fails
        await fs.writeFile('sprites.png', pngBuffer);
        console.log('Atlas saved as sprites.png');
    }
}

createAtlas().catch(err => {
    console.error('Atlas creation failed:', err);
    process.exit(1);
});
