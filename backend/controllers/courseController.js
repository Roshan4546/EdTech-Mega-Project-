const Course = require("../model/Course");
const Category = require("../model/Category");
const User = require("../model/User");
const { uploadImageCloudinary } = require("../utils/imageUploader");

// CREATE COURSE
exports.createCourse = async (req, res) => {
    try {
        // 1. Fetch data
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            categoryId
        } = req.body;

        const thumbnail = req.files?.thumbnailImage;

        // 2. Validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !categoryId || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        // 3. Instructor validation
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        // ❌ FIXED YOUR MISTAKE — you had wrong condition here
        if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
            return res.status(400).json({
                success: false,
                message: "Only instructors can create a course.",
            });
        }

        // 4. Category validation
        const categoryDetails = await Category.findById(categoryId);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Invalid category!",
            });
        }

        // 5. Upload thumbnail to cloudinary
        const thumbnailImage = await uploadImageCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // 6. Create course in DB
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // 7. Add course to Instructor's list
        await User.findByIdAndUpdate(
            instructorDetails._id,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // 8. Add course to Category
        await Category.findByIdAndUpdate(
            categoryId,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // 9. Response
        return res.status(201).json({
            success: true,
            message: "Course created successfully.",
            data: newCourse,
        });

    } catch (error) {
        console.error("Create Course Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// GET ALL COURSES
exports.getCourse = async (req, res) => {
    try {
        const courses = await Course.find({})
            .populate("instructor")
            .populate("category"); // Fixed (previously tag)

        return res.status(200).json({
            success: true,
            data: courses,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
