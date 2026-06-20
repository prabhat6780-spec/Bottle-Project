const Variant = require("../models/Variant");
const { detectTextColor } = require('../services/textColor');


// ✅ CREATE
exports.createVariant = async (req, res) => {
  try {
    const body = { ...req.body };
    // Convert status string to boolean
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }

    if (body.detectedTextColor && typeof body.detectedTextColor === 'string') {
      body.detectedTextColor = body.detectedTextColor.trim();
    }
    if (body.coatingShade && typeof body.coatingShade === 'string') {
      body.coatingShade = body.coatingShade.trim();
    }

    // Duplicate check: same bottleSpecId + same variantName (case-insensitive)
    if (body.bottleSpecId && body.variantName) {
      const existing = await Variant.findOne({
        bottleSpecId: body.bottleSpecId,
        variantName: { $regex: new RegExp(`^${body.variantName.trim()}$`, 'i') },
        isDeleted: { $ne: true }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Variant "${body.variantName}" already exists for this bottle specification. Please use a different variant name.`
        });
      }
    }

    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
      if (!body.detectedTextColor || body.detectedTextColor === "Not Detected" || body.detectedTextColor === "Analysis Failed") {
        try {
          const colorResult = await detectTextColor(req.file.path);
          if (colorResult) {
            body.detectedTextColor = colorResult.name || `RGB(${colorResult.r}, ${colorResult.g}, ${colorResult.b})`;
          } else {
            body.detectedTextColor = "Not Detected";
          }
        } catch (err) {
          console.error("Text color detection failed:", err);
          body.detectedTextColor = "Detection Failed";
        }
      }
    }

    const variant = await Variant.create(body);
    const populated = await Variant.findById(variant._id).populate({
      path: "bottleSpecId",
      populate: [
        { path: "brandId", populate: { path: "companyId" } },
        "printingTypeId",
        "printingColorId"
      ]
    });
    res.json(populated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ GET ALL
exports.getVariants = async (req, res) => {
  try {
    const { page, limit, search, pagination } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    let query = { isDeleted: { $ne: true } };

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { variantName: { $regex: regex } },
        { variantSize: { $regex: regex } }
      ];
    }

    const total = await Variant.countDocuments(query);

    const populateOpts = {
      path: "bottleSpecId",
      populate: [
        { path: "brandId", populate: { path: "companyId" } },
        "printingTypeId",
        "printingColorId"
      ]
    };

    let variants;
    if (pagination === "false") {
      variants = await Variant.find(query).sort({ createdAt: -1 }).populate(populateOpts);
      return res.json({ success: true, data: variants, total });
    } else {
      variants = await Variant.find(query)
        .sort({ createdAt: -1 })
        .populate(populateOpts)
        .skip(skip)
        .limit(parsedLimit);
    }

    res.json({
      success: true,
      data: variants,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });
  } catch (err) {
    console.log("GET VARIANTS ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updateVariant = async (req, res) => {
  try {
    const body = { ...req.body };

    // Convert status string to boolean
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }

    if (body.detectedTextColor && typeof body.detectedTextColor === 'string') {
      body.detectedTextColor = body.detectedTextColor.trim();
    }
    if (body.coatingShade && typeof body.coatingShade === 'string') {
      body.coatingShade = body.coatingShade.trim();
    }

    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
      if (!body.detectedTextColor || body.detectedTextColor === "Not Detected" || body.detectedTextColor === "Analysis Failed") {
        try {
          const colorResult = await detectTextColor(req.file.path);
          if (colorResult) {
            body.detectedTextColor = colorResult.name || `RGB(${colorResult.r}, ${colorResult.g}, ${colorResult.b})`;
          } else {
            body.detectedTextColor = "Not Detected";
          }
        } catch (err) {
          console.error("Text color detection failed:", err);
          body.detectedTextColor = "Detection Failed";
        }
      }
    }

    console.log("UPDATE BODY (converted):", body);

    const variant = await Variant.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    ).populate({
      path: "bottleSpecId",
      populate: [
        { path: "brandId", populate: { path: "companyId" } },
        "printingTypeId",
        "printingColorId"
      ]
    });

    res.json(variant);

  } catch (err) {
    console.log("UPDATE VARIANT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ✅ DELETE
exports.deleteVariant = async (req, res) => {
  try {
    await Variant.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Variant Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};