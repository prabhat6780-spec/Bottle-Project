const CoatingColor = require("../models/CoatingColor");

// ✅ CREATE (Handles single or bulk)
exports.createCoatingColor = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Bulk create
      const results = [];
      for (const item of data) {
        const existing = await CoatingColor.findOne({
          coatingTypeId: item.coatingTypeId,
          name: { $regex: new RegExp("^" + item.name.trim() + "$", "i") }
        });
        if (existing) {
          return res.status(400).json(`Color "${item.name}" already exists for this coating type.`);
        }
        results.push({
          coatingTypeId: item.coatingTypeId,
          name: item.name.trim(),
          status: typeof item.status === 'string' ? item.status === 'active' : item.status ?? true
        });
      }
      const colors = await CoatingColor.insertMany(results);
      return res.json(colors);
    } else {
      // Single create
      const existing = await CoatingColor.findOne({
        coatingTypeId: data.coatingTypeId,
        name: { $regex: new RegExp("^" + data.name.trim() + "$", "i") }
      });
      if (existing) {
        return res.status(400).json(`Color "${data.name}" already exists for this coating type.`);
      }

      const rawStatus = data.status;
      const status = typeof rawStatus === 'string'
        ? rawStatus === 'active'
        : rawStatus ?? true;

      const coatingColor = await CoatingColor.create({
        coatingTypeId: data.coatingTypeId,
        name: data.name.trim(),
        status
      });

      const populated = await CoatingColor.findById(coatingColor._id).populate("coatingTypeId");
      return res.json(populated);
    }
  } catch (err) {
    console.log("CREATE COATING COLOR ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getCoatingColors = async (req, res) => {
  try {
    const { page, limit, search, pagination } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    let query = { isDeleted: { $ne: true } };

    if (search && search.trim() !== "") {
      query.name = { $regex: new RegExp(search.trim(), "i") };
    }

    const total = await CoatingColor.countDocuments(query);

    let coatingColors;
    if (pagination === "false") {
      coatingColors = await CoatingColor.find(query).sort({ createdAt: -1 }).populate("coatingTypeId");
      return res.json({ success: true, data: coatingColors, total });
    } else {
      coatingColors = await CoatingColor.find(query)
        .sort({ createdAt: -1 })
        .populate("coatingTypeId")
        .skip(skip)
        .limit(parsedLimit);
    }

    res.json({
      success: true,
      data: coatingColors,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE
exports.updateCoatingColor = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    if (body.name) {
      const existing = await CoatingColor.findOne({
        coatingTypeId: body.coatingTypeId,
        name: { $regex: new RegExp("^" + body.name.trim() + "$", "i") },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json(`Color "${body.name}" already exists for this coating type.`);
      }
      body.name = body.name.trim();
    }

    const coatingColor = await CoatingColor.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    ).populate("coatingTypeId");
    res.json(coatingColor);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deleteCoatingColor = async (req, res) => {
  try {
    await CoatingColor.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Coating Color Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
