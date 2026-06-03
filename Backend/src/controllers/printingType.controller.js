const PrintingType = require("../models/PrintingType");

// ✅ CREATE
exports.createPrintingType = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    const status = typeof rawStatus === 'string'
      ? rawStatus === 'active'
      : rawStatus ?? true;

    const { name } = req.body;
    const existing = await PrintingType.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") } });
    if (existing) {
      return res.status(400).json(`Printing Type "${name}" already exists.`);
    }

    const printingType = await PrintingType.create({
      name: name.trim(),
      status
    });
    res.json(printingType);
  } catch (err) {
    console.log("CREATE PRINTING TYPE ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getPrintingTypes = async (req, res) => {
  try {
    const printingTypes = await PrintingType.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(printingTypes);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updatePrintingType = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    if (body.name) {
      const existing = await PrintingType.findOne({
        name: { $regex: new RegExp("^" + body.name.trim() + "$", "i") },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json(`Printing Type "${body.name}" already exists.`);
      }
      body.name = body.name.trim();
    }

    const printingType = await PrintingType.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    );
    res.json(printingType);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deletePrintingType = async (req, res) => {
  try {
    await PrintingType.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Printing Type Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
