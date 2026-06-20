const { detectTextColor } = require('../services/textColor');

exports.analyzeTextColor = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image provided. Please upload an image.'
            });
        }

        const imagePath = req.file.path;
        const colorResult = await detectTextColor(imagePath);

        if (!colorResult) {
            return res.status(200).json({
                success: false,
                message: 'No high-contrast printed text could be found on the bottle.'
            });
        }

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
        console.error('[TextColor Controller] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during text color analysis.',
            error: error.message
        });
    }
};
