const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Brand = require("./src/models/Brand");
const Variant = require("./src/models/Variant");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. original index-dropping operation
        const collection = mongoose.connection.collection('printingcolors');
        const indexes = await collection.indexes();
        const nameIdx = indexes.find(i => i.key.name === 1 && Object.keys(i.key).length === 1);
        if (nameIdx) {
            await collection.dropIndex(nameIdx.name);
            console.log('Dropped index:', nameIdx.name);
        } else {
            console.log('Index not found');
        }

        // 2. Brand & Variant name correction operation
        const brandResult = await Brand.updateMany(
            { name: "Wlid Stone" },
            { name: "Wild Stone" }
        );
        console.log("Updated Brand collections:", brandResult);

        const variantResult = await Variant.updateMany(
            { productName: "Wlid Stone Parfum" },
            { productName: "Wild Stone Parfum" }
        );
        console.log("Updated Variant collections:", variantResult);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
