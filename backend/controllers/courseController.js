const Course = require("../model/Course");
const Tag = require("../model/Tags");
const User = require("../model/User");
const { uploadImageCloudinary } = require("../utils/imageUploader");


// create Course handler
exports.createCourse = async (req, res) => {
    try {

        // data fetch
        const { courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: tagId
        } = req.body;

        const thumbnail = req.files?.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tagId || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All the fields are required !',
            });
        }

        // instructor validation
        const userId = req.user.id;

        const instructorDetails = await User.findById(userId);

        if (!instructorDetails || !instructorDetails.accountType !== "Instructor") {
            return res.status(400).json({
                success: false,
                message: 'Only Instructor can create course.',
            });
        }
        // tag level validation
        const tagDetails = await Tag.findById(tagId);
        if (!tagDetails) {
            return res.status(400).json({
                success: false,
                message: 'Tag details not found.',
            });
        }
        // image store in cloudinary
        const thumbnailImage = await uploadImageCloudinary(thumbnail, process.env.FOLDER_NAME);
        // course create in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });
        // add course entry in user db
        await User.findByIdAndDelete(
            instructorDetails._id,
            { $push: { courses: newCourse._id } },
            { new: true }
        );
        // add course in tag
        await Tag.findByIdAndUpdate(
            tagId,
            { $push: { courses: newCourse._id } },
        );
        // return res
        return res.status(200).json({
            success: true,
            message: "Course added successfully.",
            data: newCourse,
        });
    } catch (error) {
        console.error("Create Course Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}
// getAll course handler

exports.getCourse = async (req, res) => {
    try {
        const courses = await Course.find({}).populate("instructor").populate("tag");
        return res.status(200).json({
            success: true,
            data: courses,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}