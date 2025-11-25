const cloudinary = require("cloudinary").v2;

// Upload Image to Cloudinary
exports.uploadImageCloudinary = async (file, folder, height, quality) => {
    try {
        if (!file || !file.tempFilePath) {
            throw new Error("File path missing for Cloudinary upload");
        }

        const options = {
            folder: folder || "default-folder",
            resource_type: "auto",
        };

        if (height) options.height = height;
        if (quality) options.quality = quality;

        const uploadedImage = await cloudinary.uploader.upload(
            file.tempFilePath,
            options
        );

        return uploadedImage;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};
