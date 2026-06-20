const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Load the color palette
const palettePath = path.join(__dirname, '../../model/palette.json');
let TEXT_COLOR_DATABASE = [];
if (fs.existsSync(palettePath)) {
    TEXT_COLOR_DATABASE = JSON.parse(fs.readFileSync(palettePath));
    console.log(`[TextColor] Loaded ${TEXT_COLOR_DATABASE.length} colors from palette.json`);
} else {
    console.warn('[TextColor] palette.json not found at:', palettePath);
}

/**
 * Find the closest named color from the palette for a given RGB value.
 */
function getClosestColorName(r, g, b) {
    if (TEXT_COLOR_DATABASE.length === 0) return 'Unknown / Not in Palette';

    let closestColor = TEXT_COLOR_DATABASE[0];
    let minDistance = Infinity;

    for (const color of TEXT_COLOR_DATABASE) {
        const distance = Math.sqrt(
            Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    return closestColor.name;
}

/**
 * Detects the text/label color on a bottle image using sharp for pixel analysis.
 * Strategy:
 *  1. Resize the image to a manageable size for fast processing.
 *  2. Sample the "body" color from edge regions (corners + edges of the bottle).
 *  3. Find pixels in the center region that contrast strongly with the body color.
 *  4. Pick the most frequent contrasting color cluster as the text color.
 *  5. Match against palette and return the color name.
 *
 * @param {string} inputPath - Absolute path to the uploaded image file.
 * @returns {Promise<{name: string, r: number, g: number, b: number} | null>}
 */
async function detectTextColor(inputPath) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Image file not found: "${inputPath}"`);
    }

    console.log('[TextColor] Starting detection for:', inputPath);

    // 1. Load and resize to a fixed width for consistent processing
    const TARGET_WIDTH = 400;
    const { data, info } = await sharp(inputPath)
        .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
        .removeAlpha()       // force 3-channel RGB so every pixel is exactly 3 bytes
        .raw()               // get raw pixel buffer
        .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const channels = info.channels; // should be 3 (RGB) after removeAlpha()
    console.log(`[TextColor] Resized image: ${w}x${h}, channels: ${channels}`);

    /**
     * Helper: get RGB at pixel (x, y)
     */
    const getPixel = (x, y) => {
        const idx = (y * w + x) * channels;
        return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2]
        };
    };

    /**
     * Helper: collect all pixels in a rectangular region into running sums.
     */
    const accumulateRegion = (xStart, xEnd, yStart, yEnd, rAcc, gAcc, bAcc, count) => {
        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                const p = getPixel(x, y);
                rAcc.v += p.r;
                gAcc.v += p.g;
                bAcc.v += p.b;
                count.v++;
            }
        }
    };

    // 2. Sample body/background color from edge regions (avoid center where text is)
    const rA = { v: 0 }, gA = { v: 0 }, bA = { v: 0 }, cnt = { v: 0 };
    const edgeW = Math.max(1, Math.floor(w * 0.15));  // 15% edge strips
    const edgeH = Math.max(1, Math.floor(h * 0.15));

    accumulateRegion(0,         edgeW,     0,         h,         rA, gA, bA, cnt); // left strip
    accumulateRegion(w - edgeW, w,         0,         h,         rA, gA, bA, cnt); // right strip
    accumulateRegion(edgeW,     w - edgeW, 0,         edgeH,     rA, gA, bA, cnt); // top strip
    accumulateRegion(edgeW,     w - edgeW, h - edgeH, h,         rA, gA, bA, cnt); // bottom strip

    let bodyR, bodyG, bodyB;
    if (cnt.v > 0) {
        bodyR = Math.round(rA.v / cnt.v);
        bodyG = Math.round(gA.v / cnt.v);
        bodyB = Math.round(bA.v / cnt.v);
    } else {
        // Degenerate: use overall average
        const rT = { v: 0 }, gT = { v: 0 }, bT = { v: 0 }, cT = { v: 0 };
        accumulateRegion(0, w, 0, h, rT, gT, bT, cT);
        bodyR = cT.v ? Math.round(rT.v / cT.v) : 128;
        bodyG = cT.v ? Math.round(gT.v / cT.v) : 128;
        bodyB = cT.v ? Math.round(bT.v / cT.v) : 128;
    }
    console.log(`[TextColor] Body color: RGB(${bodyR}, ${bodyG}, ${bodyB})`);

    // 3. Scan central region (20%–80% width & height) for high-contrast pixels
    const xMin = Math.floor(w * 0.20);
    const xMax = Math.floor(w * 0.80);
    const yMin = Math.floor(h * 0.15);
    const yMax = Math.floor(h * 0.85);

    // Bucket contrasting pixels into color groups (quantize to 24-step buckets)
    const CONTRAST_THRESHOLD = 55;  // Euclidean RGB distance from body color
    const BUCKET_STEP = 24;
    const colorBuckets = {};

    for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
            const { r, g, b } = getPixel(x, y);
            const dist = Math.sqrt(
                Math.pow(r - bodyR, 2) +
                Math.pow(g - bodyG, 2) +
                Math.pow(b - bodyB, 2)
            );

            if (dist > CONTRAST_THRESHOLD) {
                // Quantize to a bucket key so similar colors cluster together
                const bR = Math.round(r / BUCKET_STEP) * BUCKET_STEP;
                const bG = Math.round(g / BUCKET_STEP) * BUCKET_STEP;
                const bB = Math.round(b / BUCKET_STEP) * BUCKET_STEP;
                const key = `${bR},${bG},${bB}`;
                if (!colorBuckets[key]) colorBuckets[key] = { r: 0, g: 0, b: 0, count: 0 };
                colorBuckets[key].r += r;
                colorBuckets[key].g += g;
                colorBuckets[key].b += b;
                colorBuckets[key].count++;
            }
        }
    }

    const bucketEntries = Object.values(colorBuckets);
    console.log(`[TextColor] Contrast buckets found: ${bucketEntries.length}`);

    if (bucketEntries.length === 0) {
        console.log('[TextColor] No contrasting pixels — using fallback most-common color');
        return fallbackMostCommonColor(data, w, h, channels);
    }

    // 4. Sort buckets by count; pick the most frequent one (most pixels = likely the text)
    bucketEntries.sort((a, b) => b.count - a.count);
    const best = bucketEntries[0];

    // If the top bucket is a very close match to the body color (can happen at low thresholds),
    // skip it and try the second bucket
    let chosen = best;
    const MIN_PIXELS = 8;
    if (chosen.count < MIN_PIXELS && bucketEntries.length >= 2) {
        chosen = bucketEntries[1];
    }

    if (chosen.count < MIN_PIXELS) {
        console.log('[TextColor] Not enough contrast pixels — using fallback');
        return fallbackMostCommonColor(data, w, h, channels);
    }

    const finalR = Math.round(chosen.r / chosen.count);
    const finalG = Math.round(chosen.g / chosen.count);
    const finalB = Math.round(chosen.b / chosen.count);
    const colorName = getClosestColorName(finalR, finalG, finalB);

    console.log(`[TextColor] ✅ Detected: ${colorName} — RGB(${finalR}, ${finalG}, ${finalB}) from ${chosen.count} pixels`);
    return { name: colorName, r: finalR, g: finalG, b: finalB };
}

/**
 * Fallback: pick the second most-common color in the full image
 * (the most common is usually the bottle body/background).
 */
function fallbackMostCommonColor(data, w, h, channels) {
    const BUCKET_STEP = 32;
    const colorBuckets = {};

    const yMin = Math.floor(h * 0.10);
    const yMax = Math.floor(h * 0.90);
    const xMin = Math.floor(w * 0.10);
    const xMax = Math.floor(w * 0.90);

    // Sample every other pixel for speed
    for (let y = yMin; y < yMax; y += 2) {
        for (let x = xMin; x < xMax; x += 2) {
            const idx = (y * w + x) * channels;
            const r = Math.round(data[idx]     / BUCKET_STEP) * BUCKET_STEP;
            const g = Math.round(data[idx + 1] / BUCKET_STEP) * BUCKET_STEP;
            const b = Math.round(data[idx + 2] / BUCKET_STEP) * BUCKET_STEP;
            const key = `${r},${g},${b}`;
            colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }
    }

    const sorted = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);

    // Use the 2nd most common (1st is usually the body/background)
    const entry = sorted.length >= 2 ? sorted[1] : sorted[0];
    if (!entry) return null;

    const [rStr, gStr, bStr] = entry[0].split(',');
    const r = parseInt(rStr), g = parseInt(gStr), b = parseInt(bStr);
    const colorName = getClosestColorName(r, g, b);
    console.log(`[TextColor] Fallback result: ${colorName} — RGB(${r}, ${g}, ${b})`);
    return { name: colorName, r, g, b };
}

module.exports = { detectTextColor };
