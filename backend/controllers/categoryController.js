const Category = require("../model/Category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required.",
            });
        }

        // Check duplicate category
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists.",
            });
        }

        // Create category
        const newCategory = await Category.create({
            name,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: newCategory,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: 1, description: 1 });

        return res.status(200).json({
            success: true,
            message: "All categories retrieved successfully.",
            data: allCategories,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
