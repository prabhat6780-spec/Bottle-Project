const axios = require("axios");
const fs = require("fs");

const Variant = require("../models/Variant");

exports.matchBottle = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image required"
      });
    }

    // READ IMAGE
    const imageBuffer = fs.readFileSync(req.file.path);

    const base64Image = imageBuffer.toString("base64");

    // GOOGLE VISION API
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: "TEXT_DETECTION"
              }
            ]
          }
        ]
      }
    );

    // DETECTED TEXT
    const textAnnotations =
      response.data.responses[0].textAnnotations;

    let detectedText = "";

    if (textAnnotations?.length > 0) {
      detectedText = textAnnotations[0].description
        .toLowerCase()
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();
    }

    console.log("Detected Text (Normalized):", detectedText);

    // GET ALL VARIANTS
    const variants = await Variant.find({ status: true })
      .populate({
        path: "bottleSpecId",
        populate: {
          path: "brandId"
        }
      });

    let bestMatch = null;

    let bestScore = 0;

    // MATCH LOOP
    for (let variant of variants) {
      let score = 0;
      const brandName = variant.bottleSpecId?.brandId?.name?.toLowerCase() || "";
      const productName = variant.productName?.toLowerCase() || "";
      const variantName = variant.variantName?.toLowerCase() || "";
      const variantSize = variant.variantSize?.toLowerCase() || "";

      // BRAND NAME MATCH (High Priority)
      if (brandName && detectedText.includes(brandName)) {
        score += 50;
      }

      // PRODUCT NAME
      if (productName && detectedText.includes(productName)) {
        score += 30;
      }

      // VARIANT NAME
      if (variantName && detectedText.includes(variantName)) {
        score += 40;
      }



      // VARIANT SIZE
      if (variantSize && detectedText.includes(variantSize)) {
        score += 10;
      }

      // BEST MATCH
      if (score > bestScore) {
        bestScore = score;
        bestMatch = variant;
      }
    }

    // CONFIDENCE THRESHOLD
    if (bestScore < 30) {
      bestMatch = null;
    }

    // NO MATCH
    if (!bestMatch) {

      return res.json({
        success: false,
        match: false,
        message: "Bottle Not Matched",
        detectedText
      });
    }

    // FINAL RESPONSE
    res.json({

      success: true,

      match: true,

      score: bestScore,

      detectedText,

      brandId:
        bestMatch.bottleSpecId.brandId._id,

      brandName:
        bestMatch.bottleSpecId.brandId.name,

      bottleSpecId:
        bestMatch.bottleSpecId._id,

      bottleName:
        bestMatch.bottleSpecId.bottleName,

      variantId:
        bestMatch._id,

      productName:
        bestMatch.productName,

      variantName:
        bestMatch.variantName,



      variantSize:
        bestMatch.variantSize
    });

  } catch (err) {

    console.log(
      "VISION ERROR:",
      err.response?.data || err.message
    );

    res.status(500).json({
      success: false,
      message:
        err.response?.data || err.message
    });
  }
};