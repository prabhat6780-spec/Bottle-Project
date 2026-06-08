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
      .populate("printingColorId")
      .populate("coatingTypeId")
      .populate("coatingColorId");
    res.json(populated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET
exports.getSpecs = async (req, res) => {
  try {
    const { page, limit, search, pagination } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    let query = { isDeleted: { $ne: true } };

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { bottleName: { $regex: regex } },
        { code: { $regex: regex } }
      ];
    }

    const total = await BottleSpec.countDocuments(query);

    const populateOpts = [
      {
        path: "brandId",
        populate: { path: "companyId" }
      },
      "printingTypeId",
      "printingColorId",
      "coatingTypeId",
      "coatingColorId"
    ];

    let specs;
    if (pagination === "false") {
      specs = await BottleSpec.find(query).sort({ createdAt: -1 }).populate(populateOpts);
      return res.json({ success: true, data: specs, total });
    } else {
      specs = await BottleSpec.find(query)
        .sort({ createdAt: -1 })
        .populate(populateOpts)
        .skip(skip)
        .limit(parsedLimit);
    }

    res.json({
      success: true,
      data: specs,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });
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
    })
    .populate("printingTypeId")
    .populate("printingColorId")
    .populate("coatingTypeId")
    .populate("coatingColorId");
    res.json(spec);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// DELETE
exports.deleteSpec = async (req, res) => {
  try {
    await BottleSpec.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};