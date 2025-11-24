const User = require("../model/User");
const Otp = require("../model/Otp");
const Profile = require("../model/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();


// ---------------- SEND OTP ------------------

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Generate unique OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let isDuplicate = await Otp.findOne({ otp });

        while (isDuplicate) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            isDuplicate = await Otp.findOne({ otp });
        }

        // Save OTP
        await Otp.create({ email, otp });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error("SEND OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};



// ---------------- SIGN UP ------------------

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        // Get most recent OTP
        const otpRecord = await Otp.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);

        if (otpRecord.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired."
            });
        }

        // Compare OTP
        if (otpRecord[0].otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Profile
        const profile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });

        // Create User
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetail: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: newUser,
        });

    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Signup failed.",
        });
    }
};



// ---------------- LOGIN ------------------

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email }).populate("additionalDetail");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        const payload = {
            id: user._id,
            email: user.email,
            role: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        user.token = token;
        user.password = undefined;

        const cookieOptions = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res.cookie("token", token, cookieOptions).status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user,
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed.",
        });
    }
};



// ---------------- CHANGE PASSWORD ------------------



exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Check required fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password."
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Validate old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect."
            });
        }

        // Prevent using same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from old password."
            });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // ---------------- SEND EMAIL ----------------
        await mailSender(
            user.email,
            "Password Updated Successfully",
            `
            <h2>Hello ${user.firstName},</h2>
            <p>Your password has been <b>updated successfully</b>.</p>
            <p>If you did not request this change, contact support immediately.</p>
            <br/>
            <p>Regards,<br/>Your App Team</p>
            `
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update password."
        });
    }
};
