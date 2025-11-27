const Profile = require("../model/Profile");
const User = require("../model/User");
const Course = require("../model/Course");
exports.updateProfile = async (req, res) => {
    try {
        // 1. Extract data
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        // 2. Logged-in user ID
        const userId = req.user.id;

        // 3. Validation
        if (!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "contactNumber and gender are required.",
            });
        }

        // 4. Fetch user details
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const profileId = userDetails.additionalDetail;

        // 5. Fetch profile
        const profileDetails = await Profile.findById(profileId);
        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: "Profile not found.",
            });
        }

        // 6. Update values
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        // 7. Save profile
        await profileDetails.save();

        // 8. Response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: profileDetails,
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// account delete

exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        // validation
        const userDetails = await user.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found."
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({
            _id: userDetails.additionalDetail,
        });
        // uneroll user from all enrolled course
        await user.findByIdAndDelete({
            _id: id,
        });
        // return response
        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully.",
            data: profileDetails,
        });
    } catch (error) {
        console.error("Delete Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


exports.getProfileDetails = async (req, res) => {
    try {
        // 1. Get user ID from token
        const userId = req.user.id;

        // 2. Fetch user + profile + enrolled courses
        const userDetails = await User.findById(userId)
            .populate("additionalDetail")     // profile data
            .populate("courses")              // enrolled courses
            .exec();

        // 3. If user not found
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 4. Return full profile
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: userDetails,
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile details",
            error: error.message,
        });
    }
};
