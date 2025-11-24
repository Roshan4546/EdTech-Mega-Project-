const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true,
        },

        additionalDetail: {
            type: mongoose.Schema.Types.ObjectId, // ! storing profile's ID
            ref: "Profile", // ! referring to profile model
            required: true,
        },

        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            }
        ],

        image: {
            type: String,   // URL of profile picture
            required: true,
        },

        coursesProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CourseProgress",
            }
        ],
        token: {
            type : String,
        },
        resetPasswordExpires: {
            type : Date,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
