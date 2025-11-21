const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    timeDuration: {
        type: Number,    // better than String
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    videoUrl: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
