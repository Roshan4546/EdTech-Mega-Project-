const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseDescription: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String,
        required: true
    },

    // Multiple sections
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],

    ratingAndReview: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        }
    ],

    price: {
        type: Number,
        required: true
    },

    thumbnail: {
        type: String, // URL
        required: true
    },
    tag: {
        type: [String],
        required: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },


    studentEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
