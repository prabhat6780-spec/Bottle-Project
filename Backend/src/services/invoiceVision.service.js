const stringSimilarity = require("string-similarity");
const axios = require("axios");
const pdfParse = require("pdf-parse");

/**
 * Normalizes strings for robust matching.
 */
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses numbers and units from a chunk of text near a matched raw material.
 * E.g., "100 kg 50 5000" -> quantity: 100, rate: 50, amount: 5000
 * Unchanged from your original — this logic is fine, it just needs a real
 * "row" of text to work on, which it wasn't getting for PDFs before.
 */
function extractFinancialsNearText(textChunk) {
  // Fix OCR spaces inside commas: "1, 000.00" -> "1000.00"
  let cleanChunk = textChunk.replace(/(\d)\s*,\s*(\d)/g, (match, p1, p2) => p1 + p2);
  // Remove all remaining commas
  cleanChunk = cleanChunk.replace(/,/g, '');

  // Extract all standalone numbers
  const regex = /\b\d+(?:\.\d+)?\b/g;
  const matches = [...cleanChunk.matchAll(regex)];
  let numbers = matches.map(m => parseFloat(m[0]));

  // Extract common units, supporting optional plurals (kgs, gms, tons, etc.)
  // We use (?:^|\s|\d) before to ensure we catch things like "10kgs" as well as "10 kgs"
  const unitRegex = /(?:^|\s|\d)(kgs?|g|l|ml|pcs?|pieces?|ltrs?|gms?|boxes|nos?|bags?|tons?|mt|sets?|pairs?|doz)\b/i;
  const unitMatch = cleanChunk.match(unitRegex);
  let detectedUnit = unitMatch ? unitMatch[1].toLowerCase() : "";

  let quantity = 0, rate = 0, amount = 0;
  let found = false;

  if (numbers.length >= 3) {
    // Check contiguous triplets first, starting from the END of the line
    // Financials (Qty, Rate, Amount) are almost always the right-most columns in a table.
    // This avoids false positives from item descriptions like "4 5 x 20"
    for (let i = numbers.length - 3; i >= 0; i--) {
      const a = numbers[i];
      const b = numbers[i + 1];
      const c = numbers[i + 2];

      if (a === 0 || b === 0 || c === 0) continue;

      if (Math.abs((a * b) - c) < 2) { quantity = a; rate = b; amount = c; found = true; break; }
      if (Math.abs((a * c) - b) < 2) { quantity = a; rate = c; amount = b; found = true; break; }
      if (Math.abs((b * c) - a) < 2) { quantity = b; rate = c; amount = a; found = true; break; }
    }

    if (!found) {
      // Fallback: assume the last 3 numbers are Qty, Rate, Amount (usually at the end of the row)
      amount = numbers[numbers.length - 1];
      rate = numbers[numbers.length - 2];
      quantity = numbers[numbers.length - 3];
    }
  } else if (numbers.length === 2) {
    quantity = numbers[0];
    rate = numbers[1];
    amount = quantity * rate;
  } else if (numbers.length === 1) {
    quantity = numbers[0];
  }

  // Sanity check: Rate is usually less than Amount. If swapped, fix it.
  if (rate > amount && amount > 0) {
    const temp = rate;
    rate = amount;
    amount = temp;
  }

  return {
    quantity,
    rate,
    amount,
    per: detectedUnit || ""
  };
}

async function callGoogleVisionFull(imageBuffer) {
  const apiKey = process.env.VISION_API_KEY;
  if (!apiKey) {
    throw new Error("VISION_API_KEY is not configured");
  }

  const base64Image = imageBuffer.toString("base64");
  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
        }
      ]
    }
  );

  return response.data?.responses?.[0] || {};
}

/**
 * NEW: Extracts words with real X/Y positions from a PDF using pdf-parse's
 * pagerender hook (pdf.js under the hood). This is the PDF equivalent of
 * Google Vision's word-level bounding boxes — without it, pdf-parse just
 * hands back text in internal stream order, which does NOT match the
 * visual table rows for multi-column invoice layouts (Tally-style GST
 * invoices in particular split Description / Rate / Quantity onto
 * different lines even though they're the same visual row).
 */
async function extractPdfWords(pdfBuffer) {
  const words = [];

  await pdfParse(pdfBuffer, {
    pagerender: async function (pageData) {
      const textContent = await pageData.getTextContent();
      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;
        // item.transform = [scaleX, skewX, skewY, scaleY, x, y] — PDF space, y grows upward
        const [, , , , x, y] = item.transform;
        // Negate y so that ascending sort = top-to-bottom (matches Vision's convention)
        words.push({ text: item.str, x, y: -y });
      }
      // pdf-parse still wants a string back per page; we don't use its .text field.
      return "";
    }
  });

  return words;
}

/**
 * Converts a Google Vision textAnnotations response into the same
 * {text, x, y} shape used for PDF words, so both paths can share one
 * row-grouping function.
 */
function normalizeVisionWords(visionResponse) {
  const textAnnotations = visionResponse.textAnnotations;
  if (!textAnnotations || textAnnotations.length < 2) return [];

  // Skip the first element (the full-block summary annotation)
  return textAnnotations.slice(1).map(w => {
    const v = w.boundingPoly.vertices;
    return {
      text: w.description,
      x: v[0].x,
      y: (v[0].y + v[2].y) / 2
    };
  });
}

/**
 * Groups words into visual rows by clustering on Y position within a
 * tolerance, then sorts each row left-to-right by X. This is your
 * original groupWordsIntoRows, generalized to accept plain {text,x,y}
 * words so it can be reused for both the PDF and Vision paths.
 *
 * tolerance is in source units — PDF points (~2-4) for PDFs,
 * image pixels (~15) for Vision.
 */
function groupWordsIntoRows(words, tolerance) {
  let rows = [];

  for (const w of words) {
    let matchedRow = rows.find(r => Math.abs(r.y - w.y) < tolerance);
    if (matchedRow) {
      matchedRow.words.push(w);
    } else {
      rows.push({ y: w.y, words: [w] });
    }
  }

  rows.sort((a, b) => a.y - b.y);
  rows.forEach(r => r.words.sort((a, b) => a.x - b.x));

  return rows; // [{ y, words: [{text, x, y}, ...] }, ...]
}

/**
 * Finds a value positioned just below a label word, staying within the
 * label's column (i.e. before the next column's label starts). This
 * handles two-row label/value header blocks like:
 *   Row N:   "Invoice No.   Dated"
 *   Row N+1: "384           11-Aug-26"
 * which a flat line-by-line regex can't distinguish (it can't tell that
 * "Dated" on row N is the NEXT column header, not the value).
 */
function findLabelValue(rows, labelRegex, boundaryRegex) {
  for (let i = 0; i < rows.length; i++) {
    const labelWord = rows[i].words.find(w => labelRegex.test(w.text.trim()));
    if (!labelWord) continue;

    const boundaryWord = boundaryRegex
      ? rows[i].words.find(w => boundaryRegex.test(w.text.trim()))
      : null;
    const rightBound = boundaryWord ? boundaryWord.x : Infinity;

    // Look at the next couple of rows for a word aligned under the label
    for (let j = i + 1; j < Math.min(i + 3, rows.length); j++) {
      const candidate = rows[j].words.find(
        w => w.x >= labelWord.x - 8 && w.x < rightBound - 8
      );
      if (candidate) return candidate.text.trim();
    }
  }
  return null;
}

function parseInvoiceData(ocrResult, rawMaterials) {
  let rows = [];

  if (ocrResult.type === 'pdf') {
    // ocrResult.data is the raw {text,x,y}[] from extractPdfWords
    rows = groupWordsIntoRows(ocrResult.data, 3);
  } else if (ocrResult.type === 'vision') {
    const words = normalizeVisionWords(ocrResult.data);
    rows = groupWordsIntoRows(words, 15);
  } else if (ocrResult.type === 'text') {
    // Legacy fallback path (plain text, no position data). Kept only in
    // case parseInvoiceData is ever called without position info.
    const lines = (ocrResult.data || "").split('\n').map(l => l.trim()).filter(Boolean);
    rows = lines.map(l => ({ y: 0, words: [{ text: l, x: 0 }] }));
  }

  const rowStrings = rows.map(r => r.words.map(w => w.text).join(' '));
  const fullText = rowStrings.join('\n');

  const items = [];
  const foundNames = new Set();

  // --- Invoice No / Date / Supplier: positional lookup first ---
  let invoiceNumber = findLabelValue(rows, /invoice\s*no/i, /date/i) || "";
  let invoiceDate = findLabelValue(rows, /date/i, null) || "";
  let supplierName = findLabelValue(rows, /bill from/i, null) || "";

  // --- Fallbacks for invoices with a different layout ---
  if (!invoiceNumber) {
    // \binv\b (not inv\s*#?) so this can't match inside the word "INVOICE" itself
    const invMatch = fullText.match(/(?:invoice\s*(?:no|number)|\binv\b\s*#?)\s*[:.-]?\s*([A-Za-z0-9/-]+)/i);
    if (invMatch) invoiceNumber = invMatch[1].trim();
  }

  if (!invoiceDate) {
    // Matches 11-08-2023 or 11-Aug-2026 or 11 Aug 26
    const dateMatch = fullText.match(/\b(\d{1,2}[-./\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-./\s]\d{2,4}|\d{1,2}[-./]\d{1,2}[-./]\d{2,4})\b/i);
    if (dateMatch) invoiceDate = dateMatch[1];
  }

    if (!supplierName) {
      for (let i = 0; i < Math.min(20, rowStrings.length); i++) {
        const line = rowStrings[i];
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes("irn") || lowerLine.includes("ack no") || lowerLine.includes("ack date") || lowerLine.includes("e-invoice")) {
          continue;
        }
        if (!line.includes(' ') && line.length > 15) continue;
        if (line.match(/^[a-f0-9-]+$/i)) continue;

        const companyMatch = line.match(/^(.*?)(pvt\.?\s*ltd\.?|limited|ltd\.?|industries|enterprises|corporation|llc|inc\.?)\b/i);
        if (companyMatch) {
          supplierName = companyMatch[0].replace(/^m\/s\.?\s*/i, '').trim();
          break;
        }
      }
    }

    if (!supplierName) {
      for (let i = 0; i < Math.min(15, rowStrings.length); i++) {
        const line = rowStrings[i];
        const lowerLine = line.toLowerCase();
        if (
          lowerLine.includes("invoice") || 
          lowerLine.includes("gstin") || 
          lowerLine.includes("tax") || 
          lowerLine.includes("date") ||
          lowerLine.includes("irn") ||
          lowerLine.includes("ack")
        ) {
          continue;
        }
        if (line.length > 5 && !line.match(/^\d+$/) && line.includes(' ')) {
          supplierName = line.trim();
          break;
        }
      }
    }

  // --- Line items ---
  const unmatchedItems = [];
  
  // Sort raw materials by length descending to match more specific names first
  const sortedMaterials = [...rawMaterials].sort((a, b) => b.name.length - a.name.length);

  for (const line of rowStrings) {
    let matched = false;
    let bestMatchFinancials = null;
    let matchedMaterialName = "";

    const normalizedLine = line.toLowerCase().replace(/[-_]/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    for (const material of sortedMaterials) {
      if (foundNames.has(material.name)) continue;

      const normalizedMaterialName = material.name.toLowerCase().replace(/[-_]/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const materialWords = normalizedMaterialName.split(' ').filter(Boolean);
      const allWordsPresent = materialWords.length > 0 && materialWords.every(w => {
        // Need to ensure we match whole words to prevent "ink" matching inside "pink", though includes is okay for now.
        // Let's just do a simple boundary check if possible, or stick to includes if it's simpler
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        return regex.test(normalizedLine);
      });

      const similarity = stringSimilarity.compareTwoStrings(
        normalizedLine,
        normalizedMaterialName
      );

      const isMatch =
        similarity > 0.6 ||
        normalizedLine.includes(normalizedMaterialName) ||
        allWordsPresent;

      if (isMatch) {
        matched = true;
        matchedMaterialName = material.name;
        bestMatchFinancials = extractFinancialsNearText(line);

        if (bestMatchFinancials.quantity > 0) {
          items.push({
            rawMaterialId: material._id.toString(),
            name: material.name,
            quantity: bestMatchFinancials.quantity,
            rate: bestMatchFinancials.rate,
            per: bestMatchFinancials.per,
            amount: bestMatchFinancials.amount
          });
          foundNames.add(material.name);
        }
        break; // Stop looking for materials once we find a match for this line
      }
    }

    if (!matched) {
      const lowerLine = line.toLowerCase();
      // Skip common invoice headers, footers, and addresses to avoid false positive warnings
      const skipKeywords = [
        "ack date", "ack no", "plot no", "midc", "phase", "pin-", "pin code", 
        "udyam", "gstin", "uin", "block no", "dist ", "mobno", "mob no", "mob.no", "mob.",
        "igst", "cgst", "sgst", "total", "at.po", "at po", "atpost", "vavli", "dombivli", "gujarat",
        "invoice no", "dated", "delivery note", "buyer", "dispatch", 
        "destination", "terms of", "vehicle no", "amount", "hsn", "sac",
        "description of goods", "m/s", "pvt ltd", "ltd.", "sub total", "ccipl",
        "rounding", "bank", "ifsc", "account no", "branch", "rupees", "tax",
        "supplier", "consignee", "state name", "code :"
      ];
      
      if (skipKeywords.some(kw => lowerLine.includes(kw))) {
        continue;
      }

      // Could this line be an item that is missing from DB?
      // An item line usually has at least a quantity and a rate or amount.
      const financials = extractFinancialsNearText(line);
      if (financials.quantity > 0 && (financials.rate > 0 || financials.amount > 0)) {
        // Strip out the numbers and units from the line to guess the name
        let nameGuess = line;
        nameGuess = nameGuess.replace(/\b\d+(?:\.\d+)?\b/g, ''); // remove numbers
        nameGuess = nameGuess.replace(/\b(kg|g|l|ml|pcs|ltr|gm|pieces|boxes|nos|bags|ton|mt)\b/ig, ''); // remove units
        nameGuess = nameGuess.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim(); // clean up
        
        unmatchedItems.push({
          suggestedName: nameGuess || "Unknown Item",
          quantity: financials.quantity,
          rate: financials.rate,
          per: financials.per,
          amount: financials.amount
        });
      }
    }
  }

  return {
    invoiceNumber,
    invoiceDate,
    supplierName,
    items,
    unmatchedItems
  };
}

module.exports = {
  parseInvoiceData,
  callGoogleVisionFull,
  extractFinancialsNearText,
  extractPdfWords
};