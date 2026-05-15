const BottleSpec = require("../models/bottlespecs");

// CREATE
exports.createSpec = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    const spec = await BottleSpec.create(body);
    const populated = await BottleSpec.findById(spec._id)
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate("printingTypeId")
      .populate("printingColorId");
    res.json(populated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET
exports.getSpecs = async (req, res) => {
  try {
    const specs = await BottleSpec.find()
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate("printingTypeId")
      .populate("printingColorId");
    res.json(specs);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// UPDATE
exports.updateSpec = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    const spec = await BottleSpec.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: "after" }
    ).populate({
      path: "brandId",
      populate: { path: "companyId" }
    }).populate("printingTypeId").populate("printingColorId");
    res.json(spec);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// DELETE
exports.deleteSpec = async (req, res) => {
  try {
    await BottleSpec.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};