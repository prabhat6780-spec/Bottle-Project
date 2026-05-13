const Variant = require("../models/Variant");

// ✅ CREATE
exports.createVariant = async (req, res) => {
  try {
    const body = { ...req.body };
    // Convert status string to boolean
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    const variant = await Variant.create(body);
    res.json(variant);
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
        populate: { path: "brandId" } // 🔥 To still know the brand via spec
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

    console.log("UPDATE BODY (converted):", body);

    const variant = await Variant.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    );

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