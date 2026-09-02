require("dotenv").config();
const mongoose = require("mongoose");
const Variant = require("../models/Variant");
const SgLabel = require("../models/SgLabel");

const seedSgLabels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database for seeding SG Labels");

    // Fetch all active variants
    const variants = await Variant.find({ isDeleted: false });
    let createdCount = 0;
    let skippedCount = 0;

    for (const variant of variants) {
      // Check if SG Label already exists for this variant
      const existingLabel = await SgLabel.findOne({ variantId: variant._id, isDeleted: false });
      
      if (!existingLabel && variant.bottleSpecId && variant.coatingShade) {
        // Create an SG Label
        await SgLabel.create({
          bottleId: variant.bottleSpecId,
          coatingShade: variant.coatingShade,
          variantId: variant._id,
          detectedTextColor: variant.detectedTextColor && variant.detectedTextColor !== 'Not Detected' ? variant.detectedTextColor : null,
          isDeleted: false
        });
        createdCount++;
        console.log(`Created SG Label for Variant: ${variant.variantName}`);
      } else {
        skippedCount++;
        console.log(`Skipped Variant (Already exists or missing required fields): ${variant.variantName}`);
      }
    }

    console.log(`\nSeeding completed successfully!`);
    console.log(`Total Variants Processed: ${variants.length}`);
    console.log(`New SG Labels Created: ${createdCount}`);
    console.log(`Variants Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("Error seeding SG Labels:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedSgLabels();
