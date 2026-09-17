const fs = require("fs");
const RawMaterial = require("../models/RawMaterial");
const { parseInvoiceData, callGoogleVisionFull, callGoogleVisionForPdf, extractPdfWords } = require("../services/invoiceVision.service");

exports.parseInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype;

    let ocrResult = null;

    if (mimeType === "application/pdf") {
      // Position-aware extraction — reconstructs true visual rows instead
      // of relying on pdf-parse's raw content-stream text order.
      const words = await extractPdfWords(fileBuffer);
      if (words && words.length > 0) {
        ocrResult = { type: 'pdf', data: words };
      } else {
        // Fallback to Google Vision for scanned PDFs
        const visionResult = await callGoogleVisionForPdf(filePath);
        ocrResult = { type: 'vision', data: visionResult };
      }
    } else {
      // Google Vision full response (with bounding boxes)
      const visionResult = await callGoogleVisionFull(fileBuffer);
      ocrResult = { type: 'vision', data: visionResult };
    }

    if (!ocrResult || !ocrResult.data || (Array.isArray(ocrResult.data) && ocrResult.data.length === 0)) {
      return res.status(400).json({ success: false, message: "Could not extract text from the file" });
    }

    const rawMaterials = await RawMaterial.find({ status: true, isDeleted: false });
    const parsedData = parseInvoiceData(ocrResult, rawMaterials);

    const fileUrl = "/uploads/" + req.file.filename;

    res.json({ success: true, ...parsedData, fileUrl });

  } catch (err) {
    console.error("PARSE INVOICE ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};