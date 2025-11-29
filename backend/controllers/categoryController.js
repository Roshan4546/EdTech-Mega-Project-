const Category = require("../model/Category");
const Course = require("../model/Course");
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



// category page details


exports.CategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        // 1️⃣ Validate Input
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required.",
            });
        }

        // 2️⃣ Fetch selected category with courses populated
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },   // You can remove if not needed
                populate: {
                    path: "instructor",
                    select: "firstName lastName email"
                }
            })
            .exec();

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        // 3️⃣ Fetch other categories except selected one
        const otherCategories = await Category.find({
            _id: { $ne: categoryId }
        })
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec();

        // 4️⃣ Fetch top-selling courses globally
        const topSellingCourses = await Course.find({ status: "Published" })
            .sort({ studentEnrolled: -1 })
            .limit(10)
            .populate("instructor category")
            .exec();

        // 5️⃣ Final Response
        return res.status(200).json({
            success: true,
            message: "Category page data fetched successfully.",
            data: {
                selectedCategory,
                otherCategories,
                topSellingCourses,
            }
        });

    } catch (error) {
        console.error("CategoryPageDetails Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};
