const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const textColorController = require('../controllers/textcolor.controller');
const { auth } = require("../middleware/auth.middleware");

// Set up Multer storage (saving temporarily to uploads folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure the "uploads" folder exists at your project root
    },
    filename: function (req, file, cb) {
        // Create a unique filename for the upload
        cb(null, 'bottle_upload_' + Date.now() + path.extname(file.originalname));
    }
});

// Create the upload middleware (accepts a field named 'image')
const upload = multer({ storage: storage });

// POST endpoint: /api/textcolor/analyze
// Expects form-data with a key named "image" containing the file
router.post('/analyze', auth, upload.single('image'), textColorController.analyzeTextColor);

module.exports = router;
