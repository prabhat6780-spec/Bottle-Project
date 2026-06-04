const Production = require("../models/Production");
const mongoose = require("mongoose");


// ✅ CREATE (with duplicate prevention)
const addProduction = async (req, res) => {
  try {
    const { variantId, brandId, bottleSpecId, totalPrinted, bottlePerBox, date: reqDate } = req.body;

    if (!variantId || !brandId || !bottleSpecId || !totalPrinted || !bottlePerBox) {
      return res.status(400).json({
        message: "variantId, brandId, bottleSpecId, totalPrinted and bottlePerBox are required",
      });
    }

    const date = reqDate || new Date().toISOString().split("T")[0];

    // 🚫 Prevent duplicate entry for same variant + date
    const exists = await Production.findOne({ variantId, date });
    if (exists) {
      return res.status(400).json({
        message: "Production already exists for this variant today",
      });
    }

    const totalBoxes = Math.floor(totalPrinted / bottlePerBox);
    const remainingBottles = totalPrinted % bottlePerBox;

    const production = await Production.create({
      variantId,
      brandId,
      bottleSpecId,
      date,
      totalPrinted,
      bottlePerBox,
      totalBoxes,
      remainingBottles,
    });

    const populated = await Production.findById(production._id)
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["printingTypeId", "printingColorId"]
      });

    res.status(201).json({ success: true, data: populated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL PRODUCTIONS (Backend Pagination + Search + Filters)

const getAllProduction = async (req, res) => {

  try {

    const {

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

    } = req.query;

    // ================= PAGINATION =================

    const parsedLimit =
      parseInt(limit);

    const parsedPage =
      parseInt(page);

    const skip =
      (parsedPage - 1) * parsedLimit;

    // ================= FILTER =================

    let filter = {

      isDeleted: {
        $ne: true,
      },

    };

    // Variant Filter
    if (variantId) {
      filter.variantId = variantId;
    }

    // Brand Filter
    if (brandId) {
      filter.brandId = brandId;
    }

    // Bottle Spec Filter
    if (bottleSpecId) {
      filter.bottleSpecId = bottleSpecId;
    }

    // Single Date Filter
    if (date) {
      filter.date = date;
    }

    // Date Range Filter
    if (startDate || endDate) {

      filter.date = {};

      if (startDate) {
        filter.date.$gte = startDate;
      }

      if (endDate) {
        filter.date.$lte = endDate;
      }

    }

    // ================= DATABASE QUERY =================

    let productions =
      await Production.find(filter)

        .populate("variantId")

        .populate({
          path: "brandId",
          populate: {
            path: "companyId",
          },
        })

        .populate({
          path: "bottleSpecId",
          populate: [
            "brandId",
            "printingTypeId",
            "printingColorId",
          ],
        })

        .sort({ createdAt: -1 })

        .skip(skip)

        .limit(parsedLimit)

        .lean();

    // ================= COMPANY FILTER =================

    if (companyId) {

      productions =
        productions.filter(

          (p) =>

            p.brandId?.companyId?._id?.toString() ===
            companyId

        );

    }

    // ================= SEARCH =================

    if (search) {

      const searchText =
        search.toLowerCase();

      productions =
        productions.filter((p) => {

          const brandName =
            p.brandId?.name
              ?.toLowerCase() || "";

          const companyName =
            p.brandId?.companyId?.name
              ?.toLowerCase() || "";

          const variantName =
            p.variantId?.variantName
              ?.toLowerCase() || "";

          const productName =
            p.variantId?.productName
              ?.toLowerCase() || "";

          const bottleName =
            p.bottleSpecId?.bottleName
              ?.toLowerCase() || "";

          return (

            brandName.includes(searchText) ||

            companyName.includes(searchText) ||

            variantName.includes(searchText) ||

            productName.includes(searchText) ||

            bottleName.includes(searchText)

          );

        });

    }

    // ================= TOTAL COUNT =================

    const total =
      await Production.countDocuments(filter);

    // ================= RESPONSE =================

    res.json({

      success: true,

      data: productions,

      page: parsedPage,

      totalPages:
        Math.ceil(total / parsedLimit),

      total,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};

// ✅ GET SINGLE
const getProductionById = async (req, res) => {
  try {
    const data = await Production.findById(req.params.id)
      .populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["brandId", "printingTypeId", "printingColorId"]
      });

    if (!data) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ UPDATE (recalculate values)
const updateProduction = async (req, res) => {
  try {
    const { totalPrinted, bottlePerBox, date, brandId, bottleSpecId, variantId } = req.body;

    if (!totalPrinted || !bottlePerBox) {
      return res.status(400).json({
        message: "totalPrinted and bottlePerBox are required",
      });
    }

    const totalBoxes = Math.floor(totalPrinted / bottlePerBox);
    const remainingBottles = totalPrinted % bottlePerBox;

    const updateFields = {
      totalPrinted,
      bottlePerBox,
      totalBoxes,
      remainingBottles,
    };

    if (date) updateFields.date = date;
    if (brandId) updateFields.brandId = brandId;
    if (bottleSpecId) updateFields.bottleSpecId = bottleSpecId;
    if (variantId) updateFields.variantId = variantId;

    const updated = await Production.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { returnDocument: 'after' }
    ).populate("variantId")
      .populate({
        path: "brandId",
        populate: { path: "companyId" }
      })
      .populate({
        path: "bottleSpecId",
        populate: ["brandId", "printingTypeId", "printingColorId"]
      });

    if (!updated) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ DELETE
const deleteProduction = async (req, res) => {
  try {
    const deleted = await Production.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!deleted) {
      return res.status(404).json({ message: "Production not found" });
    }

    res.json({ success: true, message: "Production deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  addProduction,
  getAllProduction,
  getProductionById,
  updateProduction,
  deleteProduction,
};