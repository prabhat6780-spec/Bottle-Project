const Operator = require("../models/Operator");

// ✅ CREATE
exports.createOperator = async (req, res) => {
  try {
    const rawStatus = req.body.status;
    const status = typeof rawStatus === 'string'
      ? rawStatus === 'active'
      : rawStatus ?? true;

    const { name } = req.body;
    const existing = await Operator.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") }, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json(`Operator "${name}" already exists.`);
    }

    const operator = await Operator.create({
      name: name.trim(),
      status
    });
    res.json(operator);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ GET
exports.getOperators = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      pagination = "true"
    } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    let filter = {
      isDeleted: { $ne: true }
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    let query = Operator.find(filter).sort({ createdAt: -1 });

    if (pagination !== "false") {
      query = query.skip(skip).limit(parsedLimit);
    }

    const operators = await query;

    if (pagination === "false") {
      return res.json({ success: true, data: operators, total: operators.length });
    }

    const total = await Operator.countDocuments(filter);

    res.json({
      success: true,
      data: operators,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ UPDATE
exports.updateOperator = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.status === 'string') {
      body.status = body.status === 'active';
    }
    if (body.name) {
      const existing = await Operator.findOne({
        name: { $regex: new RegExp("^" + body.name.trim() + "$", "i") },
        _id: { $ne: req.params.id },
        isDeleted: { $ne: true }
      });
      if (existing) {
        return res.status(400).json(`Operator "${body.name}" already exists.`);
      }
      body.name = body.name.trim();
    }

    const operator = await Operator.findByIdAndUpdate(
      req.params.id,
      body,
      { returnDocument: 'after' }
    );
    res.json(operator);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE
exports.deleteOperator = async (req, res) => {
  try {
    await Operator.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ msg: "Operator Deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
