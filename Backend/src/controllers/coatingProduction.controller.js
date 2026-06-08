const CoatingProduction = require("../models/CoatingProduction");
const mongoose = require("mongoose");

// ✅ CREATE
const addProduction = async (req, res) => {
  try {
    const { unit, variantId, brandId, bottleSpecId, operatorName, actualQuantity, rejectionQuantity, totalActualCoatedBottle, totalBottleCoated, date: reqDate } = req.body;

    if (!unit || !variantId || !brandId || !bottleSpecId || !operatorName || actualQuantity === undefined || rejectionQuantity === undefined || totalActualCoatedBottle === undefined || totalBottleCoated === undefined) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const date = reqDate || new Date().toISOString().split("T")[0];

    // Prevent duplicate entry for same variant + date + unit
    const exists = await CoatingProduction.findOne({ unit, variantId, date, isDeleted: { $ne: true } });
    if (exists) {
      return res.status(400).json({
        message: `Coating production already exists for this variant in Unit ${unit} today`,
      });
    }

    const production = await CoatingProduction.create({
      unit,
      variantId,
      brandId,
      bottleSpecId,
      operatorName,
      date,
      actualQuantity,
      rejectionQuantity,
      totalActualCoatedBottle,
      totalBottleCoated
    });

    const populated = await CoatingProduction.findById(production._id)
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["printingTypeId", "printingColorId", "coatingTypeId", "coatingColorId"]
      });

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
      variantId,
      companyId,
      brandId,
      bottleSpecId,
      date,
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
    if (variantId) filter.variantId = variantId;
    if (brandId) filter.brandId = brandId;
    if (bottleSpecId) filter.bottleSpecId = bottleSpecId;
    if (date) filter.date = date;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    let productions = await CoatingProduction.find(filter)
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["printingTypeId", "printingColorId", "coatingTypeId", "coatingColorId"]
      })
      .sort({ createdAt: -1 });

    if (companyId) {
      productions = productions.filter(p => p.brandId?.companyId?._id?.toString() === companyId);
    }

    if (search) {
      const searchText = search.toLowerCase();
      productions = productions.filter((p) => {
        const brandName = p.brandId?.name?.toLowerCase() || "";
        const companyName = p.brandId?.companyId?.name?.toLowerCase() || "";
        const variantName = p.variantId?.variantName?.toLowerCase() || "";
        const bottleName = p.bottleSpecId?.bottleName?.toLowerCase() || "";
        const opName = p.operatorName?.toLowerCase() || "";

        return (
          brandName.includes(searchText) ||
          companyName.includes(searchText) ||
          variantName.includes(searchText) ||
          bottleName.includes(searchText) ||
          opName.includes(searchText)
        );
      });
    }

    const total = productions.length;

    if (pagination === "false") {
      return res.json({
        success: true,
        data: productions,
        total,
      });
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
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["printingTypeId", "printingColorId", "coatingTypeId", "coatingColorId"]
      });

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
    const { unit, variantId, brandId, bottleSpecId, operatorName, actualQuantity, rejectionQuantity, totalActualCoatedBottle, totalBottleCoated, date } = req.body;

    const existingProduction = await CoatingProduction.findById(id);
    if (!existingProduction || existingProduction.isDeleted) {
      return res.status(404).json({ message: "Production log not found" });
    }

    if (unit && variantId && date) {
      const duplicate = await CoatingProduction.findOne({
        _id: { $ne: id },
        unit,
        variantId,
        date,
        isDeleted: { $ne: true }
      });

      if (duplicate) {
        return res.status(400).json({ message: `Coating production already exists for this variant in Unit ${unit} on ${date}` });
      }
    }

    const updated = await CoatingProduction.findByIdAndUpdate(
      id,
      { unit, variantId, brandId, bottleSpecId, operatorName, actualQuantity, rejectionQuantity, totalActualCoatedBottle, totalBottleCoated, date },
      { new: true }
    )
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["printingTypeId", "printingColorId", "coatingTypeId", "coatingColorId"]
      });

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
