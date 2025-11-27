const Section = require("../model/Section");
const SubSection = require("../model/SubSection");
const Course = require("../model/Course");

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body;

        // 1. Validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "sectionName and courseId are required.",
            });
        }

        // 2. Check valid course
        const courseExists = await Course.findById(courseId);
        if (!courseExists) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        // 3. Create new section
        const newSection = await Section.create({ sectionName });

        // 4. Push section ID into course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "SubSection",
                },
            })
            .populate("category")
            .populate("instructor");

        // 5. Response
        return res.status(200).json({
            success: true,
            message: "Section created successfully.",
            data: updatedCourse,
        });

    } catch (error) {
        console.error("Create Section Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create section.",
            error: error.message,
        });
    }
};


exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId, courseId } = req.body;

        // 1. Validation
        if (!sectionName || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "sectionName, sectionId, and courseId are required.",
            });
        }

        // 2. Check section exists
        const sectionExists = await Section.findById(sectionId);
        if (!sectionExists) {
            return res.status(404).json({
                success: false,
                message: "Section not found.",
            });
        }

        // 3. Update section
        await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        );

        // 4. Fetch updated course with populate
        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "SubSection",
                },
            })
            .populate("category")
            .populate("instructor");

        // 5. Return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully.",
            data: updatedCourse,
        });

    } catch (error) {
        console.error("Update Section Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update section.",
            error: error.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;

        // 1. Validation
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "sectionId and courseId are required.",
            });
        }

        // 2. Check section exists
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found.",
            });
        }

        // 3. Delete all subsections inside the section
        await SubSection.deleteMany({ _id: { $in: section.subSection } });

        // 4. Delete section
        await Section.findByIdAndDelete(sectionId);

        // 5. Remove section from course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $pull: { courseContent: sectionId },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .populate("category")
            .populate("instructor");

        // 6. Response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully.",
            data: updatedCourse,
        });

    } catch (error) {
        console.error("Delete Section Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete section.",
            error: error.message,
        });
    }
};
