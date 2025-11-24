const User = require("../model/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// reset password token
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from body
        const email = req.body.email;
        // check user email and
        const User = await User.findOne({ email });
        if (!User) {
            return res.status(403).json({
                success: false,
                message: "Your email is not registered with us."
            });
        }
        // generate token
        const token = crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { token },
            { password: hashedPassword, token: null, resetPasswordExpires: null },
            { new: true }
        );

        // create url
        const url = `http://localhost:3000/update-password/${token}`;
        // send mail
        await mailSender(email, "Password Reset Link", `Password Reset Link ${url}`);
        // return res
        return res.json({
            success: true,
            message: "Email sent successfully, Please change your password",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset password.",
        });
    }
}

// resetpassword
exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body;
        // validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: `password not matching`,
            });
        }
        // get user details from db using token
        const userDetails = await User.findOne({ token: token });
        // if no entry - then invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid",
            });
        }
        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired, please regenerate token",
            });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // update password
        await User.findOneAndUpdate(
            { token },
            { password: hashedPassword, token: null, resetPasswordExpires: null }
        );

        // return res
        return res.status(200).json({
            success: true,
            message: "Password reset successful."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset password."
        });
    }
}