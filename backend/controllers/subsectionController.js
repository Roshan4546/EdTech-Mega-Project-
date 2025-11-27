const subsection = require("../model/SubSection");
const Course = require("../model/Course");
const { uploadImageCloudinary } = require("../utils/imageUploader");
const Section = require("../model/Section");


// create subsection

exports.createSubSection = async (req, res) => {
    try {
        // fetch data
        const {
            title,
            timeDuration,
            description,
            sectionId,
            courseId
        } = req.body;

        // extract video
        const videoFile = req.files?.video;
        // validation
        if (!title || !timeDuration || !description || !sectionId || !courseId || !videoFile) {
            return res.status(400).json({
                success: false,
                message: "all fields are required",
            });
        }
        // upload video in cloudinary
        const video = await uploadImageCloudinary(videoFile, process.env.FOLDER_NAME);
        // create a subsection
        const newSubSection = await subsection.create({
            title,
            timeDuration,
            description,
            videoUrl: video.secure_url,
        })
        // update section
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: {
                    subSection: newSubSection._id,
                }
            },
            { new: true },
        );
        // Populate updated course
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .populate("category")
            .populate("instructor");
        // return res
        return res.status(200).json({
            success: true,
            message: "SubSection created successfully.",
            data: updatedCourse,
        });
    } catch (error) {
        console.error("Create SubSection Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create subsection.",
            error: error.message,
        });
    }
}


// update subsection

exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration, description, courseId } = req.body;

        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: "subsection is required.",
            });
        }

        const updateDate = {};
        if (title) updateDate.title = title;
        if (timeDuration) updateDate.timeDuration = timeDuration;
        if (description) updateDate.description = description;


        if (req.files?.video) {
            const video = await uploadImageCloudinary(
                req.files.video,
                process.env.FOLDER_NAME,
            );
            updateDate.videoUrl = video.secure_url;
        }
        // Update subsection
        await SubSection.findByIdAndUpdate(subsectionId, updatedData, { new: true });

        // Populate updated course
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .populate("category")
            .populate("instructor");

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully.",
            data: updatedCourse,
        });
    } catch (error) {
        console.error("update SubSection Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update subsection.",
            error: error.message,
        });
    }
}

// delete subsection

exports.deleteSubSection = async (req, res) => {
    try {
        const { subsectionId, sectionId, courseId } = req.body;

        if (!subsectionId || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "subsectionId, sectionId, courseId are required.",
            });
        }

        // Remove from Section
        await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { subSection: subsectionId } }
        );

        // Delete the subsection
        await SubSection.findByIdAndDelete(subsectionId);

        // Return updated course
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .populate("category")
            .populate("instructor");

        return res.status(200).json({
            success: true,
            message: "SubSection deleteFd successfully.",
            data: updatedCourse,
        });

    } catch (error) {
        console.error("Delete SubSection Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete subsection.",
            error: error.message,
        });
    }
};
