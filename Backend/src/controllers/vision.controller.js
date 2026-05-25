const axios = require("axios");
const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (err) {
  // Silent fallback: sharp missing binaries on Windows
}
const Variant = require("../models/Variant");

// detectTextColor logic removed from matching as per user request

// Helper to calculate image similarity using sharp (Perceptual Hashing / Pixel Match)
const getImageBuffer = async (filePath) => {
  try {
    if (!sharp) return null;
    if (!fs.existsSync(filePath)) return null;
    return await sharp(filePath)
      .resize(64, 64, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();
  } catch (err) {
    console.error("Image processing error:", err.message);
    return null;
  }
};

const calculateSimilarity = (buf1, buf2) => {
  if (!buf1 || !buf2 || buf1.length !== buf2.length) return 0;
  let diff = 0;
  for (let i = 0; i < buf1.length; i++) {
    diff += Math.abs(buf1[i] - buf2[i]);
  }
  const maxDiff = buf1.length * 255;
  const similarity = 1 - (diff / maxDiff);
  return similarity; // 0 to 1
};

exports.matchBottle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image required"
      });
    }

    const uploadedImagePath = req.file.path;
    const uploadedBuffer = await getImageBuffer(uploadedImagePath);

    // Text color detection on uploaded image removed as per user request

    // GOOGLE VISION API
    const imageBuffer = fs.readFileSync(uploadedImagePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: "TEXT_DETECTION" },
              { type: "LOGO_DETECTION" }
            ]
          }
        ]
      }
    );

    // OCR RESULTS
    const textAnnotations = response.data.responses[0].textAnnotations;
    let detectedText = "";
    if (textAnnotations?.length > 0) {
      detectedText = textAnnotations[0].description.toLowerCase().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    }

    const logoAnnotations = response.data.responses[0].logoAnnotations || [];
    const detectedLogos = logoAnnotations.map(l => l.description.toLowerCase());

    console.log("Detected Text:", detectedText);
    console.log("Detected Logos:", detectedLogos);

    const normalizeSize = (str) => {
      if (!str) return "";
      return str.toLowerCase().replace(/\s+/g, "");
    };
    const normalizedDetected = normalizeSize(detectedText);

    // GET ALL VARIANTS
    const variants = await Variant.find({ status: true })
      .populate({
        path: "bottleSpecId",
        populate: { path: "brandId" }
      });

    let bestMatch = null;
    let bestScore = 0;

    for (let variant of variants) {
      let score = 0;
      let textMatchCount = 0;

      const brandName = variant.bottleSpecId?.brandId?.name?.toLowerCase().trim() || "";
      const variantName = variant.variantName?.toLowerCase().trim() || "";
      const variantSize = variant.variantSize?.toLowerCase().trim() || "";

      if (detectedText) {
        // Strict 3-way match: Brand Name and Variant Name must match. Size must also match IF it is found in the scan text.
        const normBrand = brandName.replace(/\s+/g, "");
        const normVariant = variantName.replace(/\s+/g, "");
        const normSize = variantSize.replace(/\s+/g, "");

        const brandMatched = brandName && (
          normalizedDetected.includes(normBrand) ||
          detectedLogos.some(l => l.replace(/\s+/g, "").includes(normBrand))
        );
        const variantMatched = variantName && normalizedDetected.includes(normVariant);

        // Check if there is a size (e.g. 20ml, 50ml, 100g, etc.) printed on the scanned bottle / detected in text
        const sizeRegex = /\d+\s*(ml|l|g|kg|pcs)/i;
        const hasSizeInDetectedText = sizeRegex.test(detectedText);

        // If scanned text has a size, the variant's size must match it strictly.
        // If scanned text has NO size, we bypass the size check (treat sizeMatched as true).
        const sizeMatched = hasSizeInDetectedText
          ? (variantSize && normalizedDetected.includes(normSize))
          : true;

        if (brandMatched && variantMatched && sizeMatched) {
          // Text color verification removed - detection not based on text color

          score += 1000;
          textMatchCount += 3;

          // Product name bonus (optional, for additional confidence)
          const productName = variant.productName?.toLowerCase().trim() || "";
          const normProduct = productName.replace(/\s+/g, "");
          if (normProduct && normalizedDetected.includes(normProduct)) {
            score += 100;
          }

          // Visual similarity bonus
          if (variant.image) {
            const imagePath = variant.image.startsWith('/') ? variant.image.substring(1) : variant.image;
            const fullImagePath = path.join(__dirname, "../../", imagePath);

            const variantBuffer = await getImageBuffer(fullImagePath);
            if (variantBuffer) {
              const similarity = calculateSimilarity(uploadedBuffer, variantBuffer);
              console.log(`Similarity with ${variantName}:`, (similarity * 100).toFixed(2) + "%");
              score += similarity * 50;
            }
          }
        }
      } else {
        // Fallback to purely visual similarity when no text is detected at all
        if (variant.image) {
          const imagePath = variant.image.startsWith('/') ? variant.image.substring(1) : variant.image;
          const fullImagePath = path.join(__dirname, "../../", imagePath);

          const variantBuffer = await getImageBuffer(fullImagePath);
          if (variantBuffer) {
            const similarity = calculateSimilarity(uploadedBuffer, variantBuffer);
            console.log(`Visual similarity with ${variantName}:`, (similarity * 100).toFixed(2) + "%");
            score += similarity * 150;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = variant;
      }
    }

    // CONFIDENCE THRESHOLD
    // If text was found, we require a successful strict match (score > 1000), otherwise visual similarity.
    const finalThreshold = detectedText ? 1000 : 110;

    if (bestScore < finalThreshold) {
      bestMatch = null;
    }

    if (!bestMatch) {
      return res.json({
        success: false,
        match: false,
        message: "Bottle Not Matched",
        detectedText
      });
    }

    res.json({
      success: true,
      match: true,
      score: bestScore.toFixed(0),
      detectedText,
      brandId: bestMatch.bottleSpecId.brandId._id,
      brandName: bestMatch.bottleSpecId.brandId.name,
      bottleSpecId: bestMatch.bottleSpecId._id,
      bottleName: bestMatch.bottleSpecId.bottleName,
      variantId: bestMatch._id,
      productName: bestMatch.productName,
      variantName: bestMatch.variantName,
      variantSize: bestMatch.variantSize,
      detectedTextColor: bestMatch.detectedTextColor || 'Not Detected'
    });

  } catch (err) {
    console.error("VISION ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};