const Brand = require("../models/Brand");

// ✅ CREATE
exports.createBrand = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    // Convert status string to boolean; default true if not provided
    const status = typeof rawStatus === 'string'
      ? rawStatus === 'active'
      : rawStatus ?? true;

    const brand = await Brand.create({
      name: req.body.name,
      status
    });
    res.json(brand);
  } catch (err) {
    console.log("CREATE BRAND ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updateBrand = async (req, res) => {
  try {
    const body = { ...req.body };
    // Convert status string to boolean
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    );
    res.json(brand);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ msg: "Brand Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};