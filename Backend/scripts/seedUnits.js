require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Unit = require("../src/models/Unit");

const seedUnits = async () => {
  try {
    // Connect to the database using existing config
    await connectDB();

    const unitsToSeed = [
      { name: "Unit 1", status: true },
      { name: "Unit 2", status: true },
      { name: "Unit 3", status: true },
      { name: "Unit 4", status: true },
    ];

    for (const unitData of unitsToSeed) {
      // Check if unit already exists
      const existingUnit = await Unit.findOne({ name: unitData.name });
      
      if (existingUnit) {
        console.log(`Skipped: Unit "${unitData.name}" already exists.`);
      } else {
        await Unit.create(unitData);
        console.log(`Success: Created Unit "${unitData.name}".`);
      }
    }

  } catch (error) {
    console.error("Error seeding units:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedUnits();
