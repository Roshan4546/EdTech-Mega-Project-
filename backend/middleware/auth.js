const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();

// auth
exports.auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "") || req.body.token || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "invalid token",
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
}

// isStudent

exports.isStudent = async(req, res, next) => {
    try {
        if (req.user.role !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for students only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify",
        });
    }
}
// isInstructor
exports.isInstructor = async(req, res, next) => {
    try {
        if (req.user.role !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify",
        });
    }
}

// isAdmin
exports.isAdmin = async(req, res, next) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify",
        });
    }
}