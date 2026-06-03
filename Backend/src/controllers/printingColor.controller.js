const PrintingColor = require("../models/PrintingColor");

// ✅ CREATE (Handles single or bulk)
exports.createPrintingColor = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Bulk create
      const results = [];
      for (const item of data) {
        const existing = await PrintingColor.findOne({
          printingTypeId: item.printingTypeId,
          name: { $regex: new RegExp("^" + item.name.trim() + "$", "i") }
        });
        if (existing) {
          // Skip or error? The user said "if beardo is created then Beardo should cant created".
          // I'll error out to be safe.
          return res.status(400).json(`Color "${item.name}" already exists for this printing type.`);
        }
        results.push({
          printingTypeId: item.printingTypeId,
          name: item.name.trim(),
          status: typeof item.status === 'string' ? item.status === 'active' : item.status ?? true
        });
      }
      const colors = await PrintingColor.insertMany(results);
      return res.json(colors);
    } else {
      // Single create
      const existing = await PrintingColor.findOne({
        printingTypeId: data.printingTypeId,
        name: { $regex: new RegExp("^" + data.name.trim() + "$", "i") }
      });
      if (existing) {
        return res.status(400).json(`Color "${data.name}" already exists for this printing type.`);
      }

      const rawStatus = data.status;
      const status = typeof rawStatus === 'string'
        ? rawStatus === 'active'
        : rawStatus ?? true;

      const printingColor = await PrintingColor.create({
        printingTypeId: data.printingTypeId,
        name: data.name.trim(),
        status
      });

      const populatedColor = await PrintingColor.findById(printingColor._id).populate("printingTypeId");
      return res.json(populatedColor);
    }
  } catch (err) {
    console.log("CREATE PRINTING COLOR ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getPrintingColors = async (req, res) => {
  try {
    const printingColors = await PrintingColor.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).populate("printingTypeId");
    res.json(printingColors);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updatePrintingColor = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    if (body.name) {
      const existing = await PrintingColor.findOne({
        printingTypeId: body.printingTypeId, // assuming it's passed or unchanged
        name: { $regex: new RegExp("^" + body.name.trim() + "$", "i") },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json(`Color "${body.name}" already exists for this printing type.`);
      }
      body.name = body.name.trim();
    }

    const printingColor = await PrintingColor.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    ).populate("printingTypeId");
    res.json(printingColor);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deletePrintingColor = async (req, res) => {
  try {
    await PrintingColor.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Printing Color Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
