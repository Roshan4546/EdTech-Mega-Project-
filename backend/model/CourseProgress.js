const mongoose = require("mongoose");

const coursesProgress = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    completedVideo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("CourseProgress", coursesProgress);
