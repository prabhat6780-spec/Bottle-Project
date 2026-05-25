const fs = require('fs');
const { Jimp } = require('jimp');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

// Make sure you copy your palette.json into the Backend/model folder!
const palettePath = path.join(__dirname, '../../model/palette.json');
let TEXT_COLOR_DATABASE = [];
if (fs.existsSync(palettePath)) {
    TEXT_COLOR_DATABASE = JSON.parse(fs.readFileSync(palettePath));
    console.log(`Loaded ${TEXT_COLOR_DATABASE.length} colors from palette.json`);
} else {
    console.warn("palette.json not found at:", palettePath);
}

function getClosestColorName(r, g, b) {
    if (TEXT_COLOR_DATABASE.length === 0) return `Unknown / Not in Palette`;

    let closestColor = TEXT_COLOR_DATABASE[0];
    let minDistance = Infinity;

    for (const color of TEXT_COLOR_DATABASE) {
        const distance = Math.sqrt(
            Math.pow(r - color.r, 2) + Math.pow(g - color.g, 2) + Math.pow(b - color.b, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    return closestColor.name;
}

/**
 * Detects the text color on a bottle image.
 * Uses wider sampling regions and lower thresholds for reliable detection
 * regardless of bottle position or angle in the photo.
 * 
 * @param {string} inputArg - The absolute or relative path to the image file.
 * @returns {Promise<{name: string, r: number, g: number, b: number} | null>}
 */
async function detectTextColor(inputArg) {
    let imagePath;
    try {
        if (!fs.existsSync(inputArg)) throw new Error(`Image file "${inputArg}" not found.`);

        console.log("[TextColor] Starting detection for:", inputArg);

        // 1. Remove Background & Crop
        const inputImage = await Jimp.read(inputArg);
        if (inputImage.bitmap.width > 800) {
            const cropWidth = Math.floor(inputImage.bitmap.width * 0.6);
            const cropHeight = Math.floor(inputImage.bitmap.height * 0.6);
            const left = Math.floor((inputImage.bitmap.width - cropWidth) / 2);
            const top = Math.floor((inputImage.bitmap.height - cropHeight) / 2);
            inputImage.crop({ x: left, y: top, w: cropWidth, h: cropHeight });
        }

        const croppedBuffer = await inputImage.getBuffer('image/jpeg');
        const inputBlob = new Blob([croppedBuffer], { type: 'image/jpeg' });
        const blob = await removeBackground(inputBlob);
        const buffer = Buffer.from(await blob.arrayBuffer());

        // Save to a unique temp file in uploads
        const tempPath = path.join(__dirname, `../../uploads/tmp_nobg_${Date.now()}.png`);
        fs.writeFileSync(tempPath, buffer);
        imagePath = tempPath;

        // 2. Load clean bottle image (background removed)
        const image = await Jimp.read(imagePath);
        image.autocrop({ tolerance: 0.05, cropOnlyFrames: false });

        const w = image.bitmap.width, h = image.bitmap.height;
        console.log(`[TextColor] Image size after autocrop: ${w}x${h}`);

        // 3. Sample bottle background body color using WIDE regions
        //    Sample from all edges and the overall visible area to get a reliable body color
        let rSum = 0, gSum = 0, bSum = 0, sampleCount = 0;
        const sampleRegion = (xStart, xEnd, yStart, yEnd, step = 10) => {
            for (let y = Math.floor(h * yStart); y < Math.floor(h * yEnd); y += step) {
                for (let x = Math.floor(w * xStart); x < Math.floor(w * xEnd); x += step) {
                    if (x >= 0 && x < w && y >= 0 && y < h) {
                        const idx = (y * w + x) * 4;
                        if (image.bitmap.data[idx + 3] > 100) {
                            rSum += image.bitmap.data[idx];
                            gSum += image.bitmap.data[idx + 1];
                            bSum += image.bitmap.data[idx + 2];
                            sampleCount++;
                        }
                    }
                }
            }
        };

        // Sample from multiple wide regions (left edge, right edge, top, bottom, full)
        sampleRegion(0.02, 0.20, 0.15, 0.85);   // Left edge strip
        sampleRegion(0.80, 0.98, 0.15, 0.85);   // Right edge strip
        sampleRegion(0.02, 0.98, 0.02, 0.15);   // Top strip
        sampleRegion(0.02, 0.98, 0.85, 0.98);   // Bottom strip

        // If still not enough samples, sample broadly
        if (sampleCount < 10) {
            console.log("[TextColor] Edge sampling insufficient, using full image sample");
            sampleRegion(0.0, 1.0, 0.0, 1.0, 20);
        }

        if (sampleCount === 0) {
            console.log("[TextColor] No visible pixels found at all — fallback to most common color");
            // Fallback: use the most common color in the entire image
            return fallbackMostCommonColor(image, w, h);
        }

        const bodyR = Math.round(rSum / sampleCount);
        const bodyG = Math.round(gSum / sampleCount);
        const bodyB = Math.round(bSum / sampleCount);
        console.log(`[TextColor] Body color: RGB(${bodyR}, ${bodyG}, ${bodyB}) from ${sampleCount} samples`);

        // 4. Find high-contrast text pixels across WIDE central area
        let lightR = 0, lightG = 0, lightB = 0, lightCount = 0, lightDistSum = 0;
        let darkR = 0, darkG = 0, darkB = 0, darkCount = 0, darkDistSum = 0;

        // Scan a much wider area: 10-90% width, 10-90% height
        const CONTRAST_THRESHOLD = 50;  // Lowered from 90 for better detection
        for (let y = Math.floor(h * 0.10); y < Math.floor(h * 0.90); y++) {
            for (let x = Math.floor(w * 0.10); x < Math.floor(w * 0.90); x++) {
                const idx = (y * w + x) * 4;
                if (image.bitmap.data[idx + 3] > 150) {
                    const r = image.bitmap.data[idx], g = image.bitmap.data[idx + 1], b = image.bitmap.data[idx + 2];
                    const dist = Math.sqrt(Math.pow(r - bodyR, 2) + Math.pow(g - bodyG, 2) + Math.pow(b - bodyB, 2));

                    if (dist > CONTRAST_THRESHOLD) {
                        const brightness = (r + g + b) / 3;
                        const bodyBrightness = (bodyR + bodyG + bodyB) / 3;

                        if (brightness > bodyBrightness) {
                            lightR += r; lightG += g; lightB += b; lightCount++; lightDistSum += dist;
                        } else {
                            darkR += r; darkG += g; darkB += b; darkCount++; darkDistSum += dist;
                        }
                    }
                }
            }
        }

        console.log(`[TextColor] Contrast pixels found — Light: ${lightCount}, Dark: ${darkCount}`);

        // 5. Determine actual text color (lowered min pixel count from 50 to 10)
        const MIN_PIXELS = 10;
        let finalR, finalG, finalB, chosenCount = 0;

        const avgLightDist = lightCount > 0 ? lightDistSum / lightCount : 0;
        const avgDarkDist = darkCount > 0 ? darkDistSum / darkCount : 0;

        if (lightCount > MIN_PIXELS && darkCount > MIN_PIXELS) {
            const ratio = avgLightDist / avgDarkDist;
            let chooseLight = (ratio > 1.2) ? true : (ratio < 0.8) ? false : (lightCount >= darkCount);
            if (chooseLight) {
                finalR = Math.round(lightR / lightCount); finalG = Math.round(lightG / lightCount); finalB = Math.round(lightB / lightCount); chosenCount = lightCount;
                console.log("[TextColor] Chose: Light text");
            } else {
                finalR = Math.round(darkR / darkCount); finalG = Math.round(darkG / darkCount); finalB = Math.round(darkB / darkCount); chosenCount = darkCount;
                console.log("[TextColor] Chose: Dark text");
            }
        } else if (lightCount > MIN_PIXELS) {
            finalR = Math.round(lightR / lightCount); finalG = Math.round(lightG / lightCount); finalB = Math.round(lightB / lightCount); chosenCount = lightCount;
            console.log("[TextColor] Chose: Light text (only option)");
        } else if (darkCount > MIN_PIXELS) {
            finalR = Math.round(darkR / darkCount); finalG = Math.round(darkG / darkCount); finalB = Math.round(darkB / darkCount); chosenCount = darkCount;
            console.log("[TextColor] Chose: Dark text (only option)");
        }

        let result = null;
        if (chosenCount > 0) {
            const colorName = getClosestColorName(finalR, finalG, finalB);
            result = { name: colorName, r: finalR, g: finalG, b: finalB };
            console.log(`[TextColor] ✅ Detected: ${colorName} — RGB(${finalR}, ${finalG}, ${finalB}) from ${chosenCount} pixels`);
        } else {
            console.log("[TextColor] ⚠ No contrast text found, using fallback...");
            result = fallbackMostCommonColor(image, w, h);
        }

        // 6. Cleanup temp files
        if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        return result;

    } catch (error) {
        console.error("[TextColor] ❌ Error:", error.message);
        if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        throw error;
    }
}

/**
 * Fallback: Find the most common non-transparent, non-background color.
 * Groups pixels into color buckets and returns the most frequent one.
 */
function fallbackMostCommonColor(image, w, h) {
    const colorBuckets = {};
    const BUCKET_SIZE = 32; // Group similar colors together

    for (let y = Math.floor(h * 0.15); y < Math.floor(h * 0.85); y += 2) {
        for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x += 2) {
            const idx = (y * w + x) * 4;
            if (image.bitmap.data[idx + 3] > 150) {
                const r = Math.round(image.bitmap.data[idx] / BUCKET_SIZE) * BUCKET_SIZE;
                const g = Math.round(image.bitmap.data[idx + 1] / BUCKET_SIZE) * BUCKET_SIZE;
                const b = Math.round(image.bitmap.data[idx + 2] / BUCKET_SIZE) * BUCKET_SIZE;
                const key = `${r},${g},${b}`;
                colorBuckets[key] = (colorBuckets[key] || 0) + 1;
            }
        }
    }

    // Sort by frequency and pick the 2nd most common (1st is usually background)
    const sorted = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);

    if (sorted.length >= 2) {
        const [rStr, gStr, bStr] = sorted[1][0].split(',');
        const r = parseInt(rStr), g = parseInt(gStr), b = parseInt(bStr);
        const colorName = getClosestColorName(r, g, b);
        console.log(`[TextColor] Fallback: ${colorName} — RGB(${r}, ${g}, ${b})`);
        return { name: colorName, r, g, b };
    } else if (sorted.length === 1) {
        const [rStr, gStr, bStr] = sorted[0][0].split(',');
        const r = parseInt(rStr), g = parseInt(gStr), b = parseInt(bStr);
        const colorName = getClosestColorName(r, g, b);
        console.log(`[TextColor] Fallback (single color): ${colorName} — RGB(${r}, ${g}, ${b})`);
        return { name: colorName, r, g, b };
    }

    return null;
}

module.exports = { detectTextColor };
