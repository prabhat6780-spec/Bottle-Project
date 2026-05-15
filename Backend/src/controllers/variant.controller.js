const Variant = require("../models/Variant");

// ✅ CREATE
exports.createVariant = async (req, res) => {
  try {
    const body = { ...req.body };
    // Convert status string to boolean
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }

    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
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

    const variants = await Variant.find()
      .populate({
        path: "bottleSpecId",
        populate: [
          { path: "brandId", populate: { path: "companyId" } },
          "printingTypeId",
          "printingColorId"
        ]
      });

    res.json(variants);

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

    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
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
    await Variant.findByIdAndDelete(req.params.id);
    res.json({ msg: "Variant Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};