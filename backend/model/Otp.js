const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },

    // TTL: OTP auto-deletes after 5 minutes
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60
    }

}, {
    timestamps: true
});

// Email sending function
async function sendVerificationEmail(email, otp) {
    try {
        const emailResponse = await mailSender(
            email,
            "Verification Email - StudyNotion",
            `<h1>Your OTP is: ${otp}</h1>`
        );

        console.log("OTP Email Sent Successfully:", emailResponse);
    } catch (error) {
        console.log("Error occurred while sending OTP email:", error);
        throw error;
    }
}

// 🔥 PRE-SAVE HOOK → Send OTP when a new document is created
otpSchema.pre("save", async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("Otp", otpSchema);
