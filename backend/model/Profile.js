const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"], // ! optional but recommended
    },
    dateOfBirth: {
        type: String,   // ! you can change to Date if needed
    },
    about: {
        type: String,
        trim: true,
    },
    contactNumber: {
        type: Number,
        trim: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);
