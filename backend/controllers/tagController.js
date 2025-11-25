const Tag = require("../model/Tags");

// CREATE TAG
exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required.",
            });
        }

        // Check duplicate tag
        const existingTag = await Tag.findOne({ name });
        if (existingTag) {
            return res.status(400).json({
                success: false,
                message: "Tag already exists.",
            });
        }

        // Create a tag
        const newTag = await Tag.create({
            name,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Tag created successfully.",
            data: newTag,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// GET ALL TAGS
exports.getAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: 1, description: 1 });

        return res.status(200).json({
            success: true,
            message: "All tags retrieved successfully.",
            data: allTags,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
