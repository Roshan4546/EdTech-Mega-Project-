const RatingAndReview = require("../model/RatingAndReview");
const Course = require("../model/Course");
const mongoose = require("mongoose");

// ------------------------------------------------------
// ⭐ CREATE RATING
// ------------------------------------------------------
exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id;   // FIXED
        const { courseId, rating, review } = req.body;

        // validation
        if (!courseId || !rating) {
            return res.status(400).json({
                success: false,
                message: "CourseId and rating are required.",
            });
        }

        // check if course exists
        const courseData = await Course.findById(courseId);
        if (!courseData) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // check user enrolled
        if (!courseData.studentEnrolled.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: "User is not enrolled in this course",
            });
        }

        // check already reviewed
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course",
            });
        }

        // create rating
        const ratingReview = await RatingAndReview.create({
            user: userId,
            course: courseId,
            rating,
            review,
        });

        // add rating to course
        courseData.ratingAndReview.push(ratingReview._id);
        await courseData.save();

        return res.status(201).json({
            success: true,
            message: "Rating added successfully",
            data: ratingReview,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ------------------------------------------------------
// ⭐ GET AVERAGE RATING
// ------------------------------------------------------
exports.getAverageRating = async (req, res) => {
    try {
        const { courseId } = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                averageRating: 0,
            });
        }

        return res.status(200).json({
            success: true,
            averageRating: result[0].averageRating,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ------------------------------------------------------
// ⭐ GET ALL RATINGS (High → Low)
// ------------------------------------------------------
exports.getAllRatings = async (req, res) => {
    try {
        const ratings = await RatingAndReview.find({})
            .populate("user", "firstName lastName email image")
            .populate("course", "courseName thumbnail")
            .sort({ rating: -1 });  // high to low

        return res.status(200).json({
            success: true,
            message: "All ratings fetched successfully",
            data: ratings,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
