const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Variant = require("../models/Variant");

// Helper to calculate image similarity using sharp (Perceptual Hashing / Pixel Match)
const getImageBuffer = async (filePath) => {
  try {
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

      const brandName = variant.bottleSpecId?.brandId?.name?.toLowerCase() || "";
      const productName = variant.productName?.toLowerCase() || "";
      const variantName = variant.variantName?.toLowerCase() || "";
      const variantSize = variant.variantSize?.toLowerCase() || "";
      const normVariantSize = normalizeSize(variantSize);

      // 1. TEXT MATCHING
      if (brandName && (detectedText.includes(brandName) || detectedLogos.some(l => l.includes(brandName)))) {
        score += 60;
        textMatchCount++;
      }
      if (productName && detectedText.includes(productName)) {
        score += 30;
        textMatchCount++;
      }
      if (variantName && detectedText.includes(variantName)) {
        score += 70;
        textMatchCount++;
      }

      if (normVariantSize) {
        if (normalizedDetected.includes(normVariantSize)) {
          score += 100;
          textMatchCount++;
        } else {
          const sizeRegex = /\d+\s*(ml|l|g|kg|pcs)/gi;
          const detectedSizes = detectedText.match(sizeRegex)?.map(s => normalizeSize(s)) || [];
          if (detectedSizes.length > 0 && !detectedSizes.includes(normVariantSize)) {
            score -= 200; // Heavy penalty for size mismatch
          }
        }
      }

      // 2. DESIGN MATCHING (Visual Similarity)
      if (variant.image) {
        // Handle path resolution: check if variant.image already contains 'uploads'
        const imagePath = variant.image.startsWith('/') ? variant.image.substring(1) : variant.image;
        const fullImagePath = path.join(__dirname, "../../", imagePath);
        
        const variantBuffer = await getImageBuffer(fullImagePath);
        if (variantBuffer) {
          const similarity = calculateSimilarity(uploadedBuffer, variantBuffer);
          console.log(`Similarity with ${variantName}:`, (similarity * 100).toFixed(2) + "%");
          
          // If no text is matched, similarity becomes very important
          if (textMatchCount === 0) {
            score += similarity * 150; // Max 150 points for design similarity
          } else {
            score += similarity * 50; // Max 50 points as a bonus to text matching
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = variant;
      }
    }

    // CONFIDENCE THRESHOLD
    // If no text was found, we rely on similarity. Threshold should be reasonable.
    const finalThreshold = detectedText ? 90 : 110; 
    
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
      variantSize: bestMatch.variantSize
    });

  } catch (err) {
    console.error("VISION ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};