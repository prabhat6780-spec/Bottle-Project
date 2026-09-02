const mongoose = require("mongoose");
const RawMaterial = require("../models/RawMaterial");
const dotenv = require("dotenv");

dotenv.config();

const rawMaterials = [
  "OPEN BLACK PASTE",
  "AQUA TEXE",
  "SPARKLE SILVER LACQUER",
  "BROWN DYE",
  "BLACK DYE",
  "PINK DYE",
  "YELLOW DYE",
  "RED DYE",
  "VIOLET DYE",
  "BLUE DYE",
  "GREEN DYE",
  "ROYAL BLUE DYE",
  "ORANGE DYE",
  "BLACK MATT",
  "BLACK GLOSS",
  "WHITE GLOSS",
  "BLACK PAST",
  "MATT PAST",
  "SILVER FILLER",
  "SLOW DILUENT",
  "FAST DILUENT",
  "ECO COAT GLOSS",
  "CLEAR GLOSS"
];

const seedRawMaterials = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected.");

    for (const name of rawMaterials) {
      const existing = await RawMaterial.findOne({ name });
      if (!existing) {
        await RawMaterial.create({ name });
        console.log(`Added: ${name}`);
      } else {
        console.log(`Already exists: ${name}`);
      }
    }

    console.log("Raw Material seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding raw materials:", error);
    process.exit(1);
  }
};

seedRawMaterials();
