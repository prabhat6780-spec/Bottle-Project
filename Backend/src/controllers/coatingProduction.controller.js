const CoatingProduction = require("../models/CoatingProduction");

// ✅ CREATE
const addProduction = async (req, res) => {
  try {
    const {
      unit,
      brandId,
      coatingSpecId,
      coatingShade,
      shift,
      operatorId,
      actualQuantity,
      rejectionQuantity,
      bottlePerBox,
      rejectionReason,
      totalActualCoatedBottle,
      totalBottleCoated,
      date: reqDate
    } = req.body;

    if (
      !unit ||
      !brandId ||
      !coatingSpecId ||
      !coatingShade ||
      !shift ||
      !operatorId ||
      !bottlePerBox ||
      actualQuantity === undefined ||
      rejectionQuantity === undefined
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const date = reqDate || new Date().toISOString().split("T")[0];

    // Prevent duplicate entry for same coatingSpec + date + unit + shift
    const exists = await CoatingProduction.findOne({ unit, coatingSpecId, date, shift, isDeleted: { $ne: true } });
    if (exists) {
      return res.status(400).json({
        message: `Coating production for Shift ${shift} already exists for this spec in Unit ${unit} on ${date}`,
      });
    }

    const production = await CoatingProduction.create({
      unit,
      brandId,
      coatingSpecId,
      coatingShade,
      shift,
      operatorId,
      date,
      actualQuantity,
      rejectionQuantity,
      bottlePerBox,
      rejectionReason,
      totalActualCoatedBottle,
      totalBottleCoated
    });

    const populated = await CoatingProduction.findById(production._id)
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "coatingSpecId",
        populate: ["coatingTypeId"]
      })
      .populate("shift")
      .populate("operatorId");

    res.status(201).json({ success: true, data: populated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL
const getAllProduction = async (req, res) => {
  try {
    const {
      unit,
      brandId,
      coatingSpecId,
      date,
      companyId,
      search = "",
      limit = 10,
      page = 1,
      startDate,
      endDate,
      pagination = "true",
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    let filter = { isDeleted: { $ne: true } };

    if (unit) filter.unit = Number(unit);
    if (req.query.shift) filter.shift = req.query.shift;
    if (brandId) filter.brandId = brandId;
    if (date) filter.date = date;

    if (req.query.variantId) {
      const BottleSpec = require("../models/Bottlespecs");
      const specsWithVariant = await BottleSpec.find({ variantId: req.query.variantId }).select('_id');
      const specIds = specsWithVariant.map(s => s._id);
      
      if (coatingSpecId) {
         if (!specIds.map(id => id.toString()).includes(coatingSpecId.toString())) {
             filter.coatingSpecId = null; // Force empty result
         } else {
             filter.coatingSpecId = coatingSpecId;
         }
      } else {
         filter.coatingSpecId = { $in: specIds };
      }
    } else if (coatingSpecId) {
      filter.coatingSpecId = coatingSpecId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    let productions = await CoatingProduction.find(filter)
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "coatingSpecId",
        populate: ["coatingTypeId"]
      })
      .populate("shift")
      .populate("operatorId")
      .sort({ createdAt: -1 });

    if (companyId) {
      productions = productions.filter(p => p.brandId?.companyId?._id?.toString() === companyId);
    }

    if (search) {
      const searchText = search.toLowerCase();
      productions = productions.filter((p) => {
        const brandName = p.brandId?.name?.toLowerCase() || "";
        const companyName = p.brandId?.companyId?.name?.toLowerCase() || "";
        const bottleName = p.coatingSpecId?.bottleName?.toLowerCase() || "";
        const opName = p.operatorId?.name?.toLowerCase() || "";
        const shade = p.coatingShade?.toLowerCase() || "";
        const shiftName = p.shift?.name?.toLowerCase() || "";

        return (
          brandName.includes(searchText) ||
          companyName.includes(searchText) ||
          bottleName.includes(searchText) ||
          opName.includes(searchText) ||
          shade.includes(searchText) ||
          shiftName.includes(searchText)
        );
      });
    }

    const total = productions.length;

    if (pagination === "false") {
      return res.json({ success: true, data: productions, total });
    }

    const paginatedProductions = productions.slice(skip, skip + parsedLimit);

    res.json({
      success: true,
      data: paginatedProductions,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE
const getSingleProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const production = await CoatingProduction.findById(id)
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "coatingSpecId",
        populate: ["coatingTypeId"]
      })
      .populate("shift")
      .populate("operatorId");

    if (!production || production.isDeleted) {
      return res.status(404).json({ message: "Production log not found" });
    }

    res.status(200).json({ success: true, data: production });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE
const updateProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      unit, brandId, coatingSpecId, coatingShade, shift, operatorId,
      actualQuantity, rejectionQuantity, totalActualCoatedBottle,
      totalBottleCoated, date, bottlePerBox, rejectionReason
    } = req.body;

    const existingProduction = await CoatingProduction.findById(id);
    if (!existingProduction || existingProduction.isDeleted) {
      return res.status(404).json({ message: "Production log not found" });
    }

    if (unit && coatingSpecId && date && shift) {
      const duplicate = await CoatingProduction.findOne({
        _id: { $ne: id },
        unit,
        coatingSpecId,
        date,
        shift,
        isDeleted: { $ne: true }
      });
      if (duplicate) {
        return res.status(400).json({ message: `Coating production for Shift ${shift} already exists for this spec in Unit ${unit} on ${date}` });
      }
    }

    const updated = await CoatingProduction.findByIdAndUpdate(
      id,
      { unit, brandId, coatingSpecId, coatingShade, shift, operatorId, actualQuantity, rejectionQuantity, totalActualCoatedBottle, totalBottleCoated, date, bottlePerBox, rejectionReason },
      { new: true }
    )
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "coatingSpecId",
        populate: ["coatingTypeId"]
      })
      .populate("shift")
      .populate("operatorId");

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE (Soft Delete)
const deleteProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const production = await CoatingProduction.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!production) {
      return res.status(404).json({ message: "Production log not found" });
    }

    res.status(200).json({ success: true, message: "Production log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addProduction,
  getAllProduction,
  getSingleProduction,
  updateProduction,
  deleteProduction,
};
