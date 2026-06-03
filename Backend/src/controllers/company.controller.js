const Company = require("../models/Company");

// ✅ CREATE
exports.createCompany = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    const status = typeof rawStatus === 'string'
      ? rawStatus === 'active'
      : rawStatus ?? true;

    const { name } = req.body;
    const existing = await Company.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") } });
    if (existing) {
      return res.status(400).json(`Company "${name}" already exists.`);
    }

    const company = await Company.create({
      name: name.trim(),
      status
    });
    res.json(company);
  } catch (err) {
    console.log("CREATE COMPANY ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updateCompany = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    if (body.name) {
      const existing = await Company.findOne({
        name: { $regex: new RegExp("^" + body.name.trim() + "$", "i") },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json(`Company "${body.name}" already exists.`);
      }
      body.name = body.name.trim();
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    );
    res.json(company);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Company Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
