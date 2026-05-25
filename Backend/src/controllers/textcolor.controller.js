let detectTextColor;
try {
    detectTextColor = require('../services/textColor').detectTextColor;
} catch (error) {
    // Silent fallback: sharp missing binaries on Windows
    detectTextColor = async () => null;
}

exports.analyzeTextColor = async (req, res) => {
    try {
        // 1. Check if an image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image provided. Please upload an image."
            });
        }

        const imagePath = req.file.path;

        // 2. Pass the image to the AI service
        const colorResult = await detectTextColor(imagePath);

        // 3. Handle cases where text couldn't be found
        if (!colorResult) {
            return res.status(404).json({
                success: false,
                message: "No high-contrast printed text could be found on the bottle."
            });
        }

        // 4. Return the successful result
        return res.status(200).json({
            success: true,
            data: {
                detectedName: colorResult.name,
                rgb: `RGB(${colorResult.r}, ${colorResult.g}, ${colorResult.b})`,
                rawColors: {
                    r: colorResult.r,
                    g: colorResult.g,
                    b: colorResult.b
                }
            }
        });

    } catch (error) {
        console.error("Text Color Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during text color analysis.",
            error: error.message
        });
    }
};
