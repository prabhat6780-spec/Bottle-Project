const Brand = require("../models/Brand");

// ✅ CREATE
exports.createBrand = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    // Convert status string to boolean; default true if not provided
    const status = typeof rawStatus === 'string'
      ? rawStatus === 'active'
      : rawStatus ?? true;

    const { name, companyId } = req.body;
    const existing = await Brand.findOne({ companyId, name: { $regex: new RegExp("^" + name.trim() + "$", "i") } });
    if (existing) {
      return res.status(400).json(`Brand "${name}" already exists for this company.`);
    }

    const brand = await Brand.create({
      companyId,
      name: name.trim(),
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
    const brands = await Brand.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).populate("companyId", "name status");
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
    if (body.name || body.companyId) {
      const brandToUpdate = await Brand.findById(req.params.id);
      const targetName = body.name ? body.name.trim() : brandToUpdate.name;
      const targetCompanyId = body.companyId || brandToUpdate.companyId;

      const existing = await Brand.findOne({
        companyId: targetCompanyId,
        name: { $regex: new RegExp("^" + targetName + "$", "i") },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json(`Brand "${targetName}" already exists for this company.`);
      }
      if (body.name) body.name = body.name.trim();
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
    await Brand.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Brand Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};