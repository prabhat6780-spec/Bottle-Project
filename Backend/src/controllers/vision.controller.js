const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (err) {
  // Optional: image similarity disabled when sharp is unavailable
}

const Variant = require("../models/Variant");
const {
  getVisionConfig,
  buildOcrCorrectionMap,
  applyOcrCorrections,
  callGoogleVision,
  normalizeCompact,
  normalizePhrase,
  pickBestMatch,
  formatMatchResponse,
  extractSizesFromText
} = require("../services/visionMatching.service");
const { transliterate } = require("transliteration");

const getImageBuffer = async (filePath) => {
  try {
    if (!sharp) return null;
    if (!fs.existsSync(filePath)) return null;
    return await sharp(filePath)
      .resize(64, 64, { fit: "fill" })
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
  return 1 - diff / maxDiff;
};

const resolveVariantImagePath = (variant) => {
  if (!variant?.image) return null;
  const imagePath = variant.image.startsWith("/")
    ? variant.image.substring(1)
    : variant.image;
  return path.join(__dirname, "../../", imagePath);
};

const buildSimilarityFn = (uploadedBuffer, variantBufferCache) => (variant) => {
  if (!uploadedBuffer || !variant.image) return 0;
  const fullPath = resolveVariantImagePath(variant);
  if (!fullPath) return 0;

  if (!variantBufferCache.has(variant._id.toString())) {
    return 0;
  }

  return calculateSimilarity(uploadedBuffer, variantBufferCache.get(variant._id.toString()));
};

exports.matchBottle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image required"
      });
    }

    const config = getVisionConfig();
    const uploadedImagePath = req.file.path;
    const uploadedBuffer = await getImageBuffer(uploadedImagePath);
    const imageBuffer = fs.readFileSync(uploadedImagePath);

    const { detectedText: rawDetectedText, detectedLogos } = await callGoogleVision(imageBuffer, config);

    const variants = await Variant.find({
      status: true,
      isDeleted: { $ne: true }
    }).populate({
      path: "bottleSpecId",
      match: { status: true, isDeleted: { $ne: true } },
      populate: [
        { path: "brandId", populate: { path: "companyId" } },
        { path: "printingTypeId" },
        { path: "printingColorId" }
      ]
    });

    const activeVariants = variants.filter((v) => v.bottleSpecId);
    const correctionMap = buildOcrCorrectionMap(activeVariants, config);
    const detectedText = applyOcrCorrections(rawDetectedText, correctionMap);

    const transliteratedText = transliterate(detectedText);
    const normalizedDetected = normalizeCompact(`${detectedText} ${transliteratedText}`);
    const detectedPhrase = normalizePhrase(detectedText);
    const transliteratedPhrase = normalizePhrase(transliteratedText);
    const detectedSizes = extractSizesFromText(`${detectedText} ${transliteratedText}`);

    console.log("Detected Text:", detectedText);
    console.log("Detected Sizes:", detectedSizes.map((s) => s.key).join(", ") || "none");
    console.log("Detected Logos:", detectedLogos);

    const variantBufferCache = new Map();
    if (uploadedBuffer) {
      for (const variant of activeVariants) {
        const fullPath = resolveVariantImagePath(variant);
        if (!fullPath) continue;
        const variantBuffer = await getImageBuffer(fullPath);
        if (variantBuffer) {
          variantBufferCache.set(variant._id.toString(), variantBuffer);
        }
      }
    }

    const matchContext = {
      config,
      detectedText,
      detectedSizes,
      detectedLogos,
      normalizedDetected,
      detectedPhrase,
      transliteratedPhrase,
      uploadedBuffer,
      calculateSimilarity: buildSimilarityFn(uploadedBuffer, variantBufferCache)
    };

    const matchResult = pickBestMatch(activeVariants, matchContext);

    if (!matchResult.bestMatch) {
      return res.json({
        success: false,
        match: false,
        message: detectedSizes.length > 0
          ? `Bottle Not Matched (size ${detectedSizes.map((s) => s.key).join(", ")} not found in catalog)`
          : "Bottle Not Matched",
        detectedText,
        detectedSizes: detectedSizes.map((s) => s.key)
      });
    }

    return res.json(
      formatMatchResponse(
        matchResult.bestMatch,
        matchResult.bestScore,
        detectedText,
        detectedSizes,
        {
          sizeOptions: matchResult.sizeOptions,
          sizeSelectionRequired: matchResult.sizeSelectionRequired,
          detectedSizeOnBottle: matchResult.detectedSizeOnBottle
        }
      )
    );
  } catch (err) {
    console.error("VISION ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
