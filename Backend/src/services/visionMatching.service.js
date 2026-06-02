const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { transliterate } = require("transliteration");
const stringSimilarity = require("string-similarity");

const CONFIG_PATH = path.join(__dirname, "../../model/vision.config.json");

const DEFAULT_CONFIG = {
  languageHints: ["hi", "en"],
  visionFeatures: ["TEXT_DETECTION", "LOGO_DETECTION"],
  thresholds: {
    textMatchMinScore: 400,
    visualOnlyMinScore: 110,
    fuzzyPhraseMin: 0.7,
    fuzzyWordMin: 0.75,
    wordMatchRatioMin: 0.6
  },
  weights: {
    brandMatch: 500,
    variantMatch: 500,
    companyMatch: 100,
    sizeMatch: 200,
    wordBonus: 150,
    wordPenalty: 150,
    visualMultiplier: 50,
    visualOnlyMultiplier: 150
  },
  sizeRegex: "\\d+\\s*(ml|l|g|kg|pcs)",
  globalOcrCorrections: {}
};

let cachedConfig = null;

function getVisionConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const file = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      cachedConfig = {
        ...DEFAULT_CONFIG,
        ...file,
        thresholds: { ...DEFAULT_CONFIG.thresholds, ...(file.thresholds || {}) },
        weights: { ...DEFAULT_CONFIG.weights, ...(file.weights || {}) },
        globalOcrCorrections: {
          ...DEFAULT_CONFIG.globalOcrCorrections,
          ...(file.globalOcrCorrections || {})
        }
      };
      return cachedConfig;
    }
  } catch (err) {
    console.warn("[Vision] Failed to load vision.config.json, using defaults:", err.message);
  }
  cachedConfig = DEFAULT_CONFIG;
  return cachedConfig;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCompact(str) {
  if (!str) return "";
  return String(str).toLowerCase().replace(/\s+/g, "");
}

function normalizePhrase(str) {
  if (!str) return "";
  return String(str).toLowerCase().trim();
}

const SIZE_TOKEN_PATTERN = /(\d+(?:\.\d+)?)\s*(ml|l|g|kg|pcs)\b/gi;

/**
 * Canonical size key for strict equality (e.g. "20ml", "50ml", "1l").
 */
function toSizeKey(value, unit) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  const u = String(unit).toLowerCase();
  const compactValue = Number.isInteger(num) ? String(num) : String(num);
  return `${compactValue}${u}`;
}

function parseSizeFromString(str) {
  if (!str) return null;
  const match = String(str).match(/(\d+(?:\.\d+)?)\s*(ml|l|g|kg|pcs)\b/i);
  if (!match) return null;
  const key = toSizeKey(match[1], match[2]);
  return key ? { key, value: parseFloat(match[1]), unit: match[2].toLowerCase() } : null;
}

/**
 * Extract every size printed in OCR text (e.g. "20 ml", "50ml").
 */
function extractSizesFromText(text) {
  if (!text) return [];
  const sizes = [];
  const seen = new Set();
  const pattern = new RegExp(SIZE_TOKEN_PATTERN.source, "gi");
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const key = toSizeKey(match[1], match[2]);
    if (key && !seen.has(key)) {
      seen.add(key);
      sizes.push({
        key,
        value: parseFloat(match[1]),
        unit: match[2].toLowerCase()
      });
    }
  }

  return sizes;
}

/**
 * When OCR found a size, variant must have the same size (20 ml scan → 20 ml variant only).
 */
function variantMatchesDetectedSize(variantSize, detectedSizes) {
  if (!detectedSizes || detectedSizes.length === 0) {
    return true;
  }

  const variantParsed = parseSizeFromString(variantSize);
  if (!variantParsed) {
    return false;
  }

  return detectedSizes.some((d) => d.key === variantParsed.key);
}

function collectVariantTerms(variant) {
  const spec = variant.bottleSpecId;
  const brand = spec?.brandId;
  const terms = new Set();

  const add = (value) => {
    if (value == null || value === "") return;
    terms.add(String(value).toLowerCase().trim());
  };

  add(variant.variantName);
  add(variant.variantSize);
  add(variant.coatingShade);
  add(brand?.name);
  add(brand?.companyId?.name);
  add(spec?.bottleName);
  add(spec?.code);
  add(spec?.printingTypeId?.name);
  add(spec?.printingColorId?.name);

  return [...terms];
}

/**
 * Build OCR correction map from config + transliterations of DB terms (no hardcoded product names).
 */
function buildOcrCorrectionMap(variants, config = getVisionConfig()) {
  const map = { ...(config.globalOcrCorrections || {}) };

  const register = (alias, canonical) => {
    if (!alias || !canonical) return;
    const a = normalizePhrase(alias);
    const c = normalizePhrase(canonical);
    if (a.length < 2 || a === c) return;
    if (!map[a]) map[a] = c;
  };

  const seenTerms = new Set();

  for (const variant of variants) {
    for (const term of collectVariantTerms(variant)) {
      if (seenTerms.has(term)) continue;
      seenTerms.add(term);

      const translit = transliterate(term);
      if (translit && translit !== term) {
        register(translit, term);
        register(normalizeCompact(translit), normalizeCompact(term));
      }

      if (/y/i.test(term) && term.length >= 4) {
        register(term.replace(/y/gi, "i"), term);
      }
    }
  }

  return map;
}

function applyOcrCorrections(text, correctionMap) {
  let result = text;
  const entries = Object.entries(correctionMap).sort((a, b) => b[0].length - a[0].length);

  for (const [wrong, correct] of entries) {
    const regex = new RegExp(`\\b${escapeRegex(wrong)}\\b`, "gi");
    result = result.replace(regex, correct);
  }

  return result;
}

async function callGoogleVision(imageBuffer, config = getVisionConfig()) {
  const apiKey = process.env.VISION_API_KEY;
  if (!apiKey) {
    throw new Error("VISION_API_KEY is not configured");
  }

  const base64Image = imageBuffer.toString("base64");
  const features = (config.visionFeatures || DEFAULT_CONFIG.visionFeatures).map((type) => ({ type }));

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features,
          imageContext: {
            languageHints: config.languageHints || DEFAULT_CONFIG.languageHints
          }
        }
      ]
    }
  );

  const visionResponse = response.data?.responses?.[0] || {};
  const textAnnotations = visionResponse.textAnnotations || [];
  let detectedText = "";

  if (textAnnotations.length > 0) {
    detectedText = textAnnotations[0].description
      .toLowerCase()
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const detectedLogos = (visionResponse.logoAnnotations || []).map((l) =>
    l.description.toLowerCase()
  );

  return { detectedText, detectedLogos };
}

function termMatchesDetected(term, ctx) {
  if (!term) return false;
  const compact = normalizeCompact(term);
  const phrase = normalizePhrase(term);

  return (
    ctx.normalizedDetected.includes(compact) ||
    ctx.detectedPhrase.includes(phrase) ||
    ctx.transliteratedPhrase.includes(phrase) ||
    ctx.detectedLogos.some((logo) => logo.replace(/\s+/g, "").includes(compact))
  );
}

function fuzzyPhraseMatches(term, ctx, thresholds) {
  if (!term) return false;
  const phrase = normalizePhrase(term);
  const simOriginal = stringSimilarity.compareTwoStrings(phrase, ctx.detectedPhrase);
  const simTranslit = stringSimilarity.compareTwoStrings(phrase, ctx.transliteratedPhrase);
  return Math.max(simOriginal, simTranslit) > thresholds.fuzzyPhraseMin;
}

function fuzzyWordMatches(term, ctx, thresholds) {
  if (!term) return false;
  const words = normalizePhrase(term).split(/\s+/).filter((w) => w.length >= 3);
  const detectedWords = `${ctx.detectedPhrase} ${ctx.transliteratedPhrase}`.split(/\s+/);
  let wordMatchCount = 0;

  for (const vWord of words) {
    for (const dWord of detectedWords) {
      if (dWord.length < 3) continue;
      if (stringSimilarity.compareTwoStrings(vWord, dWord) > thresholds.fuzzyWordMin) {
        wordMatchCount++;
        break;
      }
    }
  }

  return words.length > 0 && wordMatchCount / words.length >= thresholds.wordMatchRatioMin;
}

function resolveFieldMatch(term, ctx, thresholds) {
  if (termMatchesDetected(term, ctx)) return true;
  if (fuzzyPhraseMatches(term, ctx, thresholds)) return true;
  return fuzzyWordMatches(term, ctx, thresholds);
}

function scoreVariant(variant, ctx) {
  const config = ctx.config;
  const weights = config.weights;
  const thresholds = config.thresholds;

  const spec = variant.bottleSpecId;
  const brand = spec?.brandId;
  const brandName = brand?.name || "";
  const companyName = brand?.companyId?.name || "";
  const variantName = variant.variantName || "";
  const variantSize = variant.variantSize || "";
  const coatingShade = variant.coatingShade || "";

  let score = 0;

  if (!ctx.detectedText) {
    if (variant.image && ctx.uploadedBuffer && ctx.calculateSimilarity) {
      const similarity = ctx.calculateSimilarity(variant);
      score += similarity * weights.visualOnlyMultiplier;
    }
    return score;
  }

  const brandMatched = resolveFieldMatch(brandName, ctx, thresholds);
  const companyMatched = resolveFieldMatch(companyName, ctx, thresholds);
  let variantMatched = resolveFieldMatch(variantName, ctx, thresholds);

  if (!variantMatched && coatingShade) {
    variantMatched = resolveFieldMatch(coatingShade, ctx, thresholds);
  }

  const hasSizeInDetectedText = ctx.detectedSizes?.length > 0;
  const sizeMatched = variantMatchesDetectedSize(variantSize, ctx.detectedSizes);

  if (hasSizeInDetectedText && !sizeMatched) {
    return 0;
  }

  if (!(brandMatched || companyMatched || variantMatched)) {
    return 0;
  }

  if (brandMatched) score += weights.brandMatch;
  if (companyMatched) score += weights.companyMatch;
  if (variantMatched) score += weights.variantMatch;
  if (sizeMatched && hasSizeInDetectedText) score += weights.sizeMatch;

  const searchWords = (variantName + " " + (variantSize || "") + " " + (coatingShade || ""))
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const detectedWords = `${ctx.detectedPhrase} ${ctx.transliteratedPhrase}`.toLowerCase();

  for (const word of searchWords) {
    if (detectedWords.includes(word)) {
      score += weights.wordBonus;
    } else {
      score -= weights.wordPenalty;
    }
  }

  if (variant.image && ctx.uploadedBuffer && ctx.calculateSimilarity) {
    score += ctx.calculateSimilarity(variant) * weights.visualMultiplier;
  }

  return score;
}

function sizeToSortValue(parsed) {
  if (!parsed) return Number.MAX_SAFE_INTEGER;
  if (parsed.unit === "ml") return parsed.value;
  if (parsed.unit === "l") return parsed.value * 1000;
  if (parsed.unit === "g") return parsed.value;
  if (parsed.unit === "kg") return parsed.value * 1000;
  return parsed.value;
}

function sortVariantsBySize(variants) {
  return [...variants].sort((a, b) => {
    const pa = parseSizeFromString(a.variantSize);
    const pb = parseSizeFromString(b.variantSize);
    if (!pa && !pb) return 0;
    if (!pa) return 1;
    if (!pb) return -1;
    if (pa.unit !== pb.unit) return pa.unit.localeCompare(pb.unit);
    return sizeToSortValue(pa) - sizeToSortValue(pb);
  });
}

function getVariantSiblings(variant, allVariants) {
  const specId = variant.bottleSpecId?._id?.toString();
  const name = normalizePhrase(variant.variantName);
  if (!specId || !name) return [variant];

  const siblings = allVariants.filter((v) => {
    const vSpecId = v.bottleSpecId?._id?.toString();
    return vSpecId === specId && normalizePhrase(v.variantName) === name;
  });

  return siblings.length > 0 ? siblings : [variant];
}

function buildSizeOptions(variants) {
  return sortVariantsBySize(variants).map((v) => ({
    variantId: v._id,
    variantName: v.variantName,
    variantSize: v.variantSize || "N/A",
    coatingShade: v.coatingShade || null,
    detectedTextColor: v.detectedTextColor || "Not Detected"
  }));
}

function pickHighestScoringVariant(variantPool, ctx) {
  let best = null;
  let bestScore = 0;
  for (const variant of variantPool) {
    const score = scoreVariant(variant, ctx);
    if (score > bestScore) {
      bestScore = score;
      best = variant;
    }
  }
  return { variant: best, score: bestScore };
}

function pickBestMatch(variants, ctx) {
  const minScore = ctx.detectedText
    ? ctx.config.thresholds.textMatchMinScore
    : ctx.config.thresholds.visualOnlyMinScore;

  const scored = variants
    .map((variant) => ({ variant, score: scoreVariant(variant, ctx) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { bestMatch: null, bestScore: 0, sizeOptions: [], sizeSelectionRequired: false };
  }

  const anchor = scored[0].variant;
  let siblingPool = getVariantSiblings(anchor, variants);

  const hasSizeOnBottle = ctx.detectedSizes?.length > 0;
  if (hasSizeOnBottle) {
    siblingPool = siblingPool.filter((v) =>
      variantMatchesDetectedSize(v.variantSize, ctx.detectedSizes)
    );
    if (siblingPool.length === 0) {
      return { bestMatch: null, bestScore: 0, sizeOptions: [], sizeSelectionRequired: false };
    }
  }

  const sortedBySize = sortVariantsBySize(siblingPool);
  let bestMatch;
  let bestScore;

  if (hasSizeOnBottle) {
    const top = pickHighestScoringVariant(sortedBySize, ctx);
    bestMatch = top.variant;
    bestScore = top.score;
  } else {
    const withParsedSize = sortedBySize.filter((v) => parseSizeFromString(v.variantSize));
    if (withParsedSize.length > 0) {
      bestMatch = withParsedSize[0];
    } else {
      bestMatch = pickHighestScoringVariant(sortedBySize, ctx).variant;
    }
    bestScore = scoreVariant(bestMatch, ctx);
  }

  if (bestScore < minScore) {
    return { bestMatch: null, bestScore: 0, sizeOptions: [], sizeSelectionRequired: false };
  }

  const sizeOptions = buildSizeOptions(sortedBySize);
  const sizeSelectionRequired = !hasSizeOnBottle && sizeOptions.length > 1;

  return {
    bestMatch,
    bestScore,
    sizeOptions,
    sizeSelectionRequired,
    detectedSizeOnBottle: hasSizeOnBottle ? ctx.detectedSizes[0]?.key : null
  };
}

function formatMatchResponse(variant, bestScore, detectedText, detectedSizes = [], matchMeta = {}) {
  const spec = variant.bottleSpecId;
  const brand = spec?.brandId;
  const sizeOptions = matchMeta.sizeOptions || buildSizeOptions([variant]);

  return {
    success: true,
    match: true,
    score: bestScore.toFixed(0),
    detectedText,
    detectedSizes: detectedSizes.map((s) => s.key),
    detectedSizeOnBottle: matchMeta.detectedSizeOnBottle || null,
    sizeSelectionRequired: Boolean(matchMeta.sizeSelectionRequired),
    sizeOptions,
    brandId: brand?._id,
    brandName: brand?.name,
    companyId: brand?.companyId?._id,
    companyName: brand?.companyId?.name,
    bottleSpecId: spec?._id,
    bottleName: spec?.bottleName,
    variantId: variant._id,
    variantName: variant.variantName,
    variantSize: variant.variantSize,
    coatingShade: variant.coatingShade || null,
    detectedTextColor: variant.detectedTextColor || "Not Detected"
  };
}

module.exports = {
  getVisionConfig,
  buildOcrCorrectionMap,
  applyOcrCorrections,
  callGoogleVision,
  normalizeCompact,
  normalizePhrase,
  extractSizesFromText,
  variantMatchesDetectedSize,
  parseSizeFromString,
  scoreVariant,
  pickBestMatch,
  formatMatchResponse,
  collectVariantTerms
};
