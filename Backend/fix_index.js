const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');
        const collection = mongoose.connection.collection('printingcolors');
        const indexes = await collection.indexes();
        const nameIdx = indexes.find(i => i.key.name === 1 && Object.keys(i.key).length === 1);
        if (nameIdx) {
            await collection.dropIndex(nameIdx.name);
            console.log('Dropped index:', nameIdx.name);
        } else {
            console.log('Index not found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
