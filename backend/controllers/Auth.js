const User = require("../model/User");
const Otp = require("../model/Otp");
const Profile = require("../model/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ---------------- SEND OTP ------------------

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const checkUserExists = await User.findOne({ email });

        if (checkUserExists) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            });
        }

        // Generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP generated:", otp);

        // Ensure OTP is unique
        let existingOtp = await Otp.findOne({ otp });
        while (existingOtp) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            existingOtp = await Otp.findOne({ otp });
        }

        // Save OTP
        await Otp.create({ email, otp });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            // otp   ❌ remove this in production
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
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

        // Required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match."
            });
        }

        // Check user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        // Find most recent OTP
        const recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
        // .sort({ createdAt: -1 })
        // Sort them so the newest OTP comes first.
        // -1 = descending (latest to oldest)
        // +1 = ascending (oldest to latest)
        // .limit(1)
        // Take only the most recent OTP.

        if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });

        // Create user in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetail: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully.",
            user
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong during signup.",
            error: error.message
        });
    }
};




// Login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // 2. Check user exists
        const user = await User.findOne({ email }).populate("additionalDetail");
        // make sure schema field name is "additionalDetail"

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first."
            });
        }

        // 3. Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        // 4. Create JWT token
        const payload = {
            email: user.email,
            id: user._id,
            role: user.accountType     // your schema uses "accountType"
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        user.token = token;
        user.password = undefined;

        // 5. Send cookie
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user,
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong during login.",
            error: error.message
        });
    }
}



// TODO: change password


