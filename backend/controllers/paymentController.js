const { instance } = require("../config/razorpay");
const Course = require("../model/Course");
const User = require("../model/User");
const mongoose = require("mongoose");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const courseEnrollTemplate = require("../mail/template/courseEntroll");

// CAPTURE PAYMENT
exports.capturePayment = async (req, res) => {
    try {
        const { course_id } = req.body;
        const userId = req.user.id;

        if (!course_id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Avoid double purchase
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentEnrolled.includes(uid)) {
            return res.status(400).json({
                success: false,
                message: "User already purchased this course",
            });
        }

        // Create Razorpay order
        const optionObject = {
            amount: course.price * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                course_id: course_id,
                userId: userId,
            },
        };

        const paymentResponse = await instance.orders.create(optionObject);

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            orderId: paymentResponse.id,
            amount: paymentResponse.amount,
            currency: paymentResponse.currency,
            courseName: course.courseName,
            thumbnail: course.thumbnail,
        });

    } catch (error) {
        console.error("Payment Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



// WEBHOOK
exports.paymentWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (digest !== req.headers["x-razorpay-signature"]) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const event = req.body.event;

        if (event === "payment.captured") {
            const payment = req.body.payload.payment.entity;

            const userId = payment.notes.userId;
            const courseId = payment.notes.course_id;

            // ENROLL USER
            const user = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { purchasedCourses: courseId } },
                { new: true }
            );

            const course = await Course.findByIdAndUpdate(
                courseId,
                { $addToSet: { studentEnrolled: userId } },
                { new: true }
            );

            // SEND EMAIL
            await mailSender(
                user.email,
                "Course Enrolled Successfully!",
                courseEnrollTemplate(user.firstName, course.courseName)
            );

            console.log("✔ User enrolled + email sent");
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ success: false });
    }
};
