// Import Cloudinary SDK (v2 version)
import { v2 as cloudinary } from "cloudinary";

// Node.js file system module (used to delete local files)
import fs from "fs";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // API secret
});

/**
 * Uploads a file from local storage to Cloudinary
 * @param {string} localFilePath - path of the file stored locally (by multer)
 * @returns {object|null} - Cloudinary response object or null if failed
 */
const uploadCloudinary = async (localFilePath) => {
    try {
        // If no file path is provided, exit early
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // auto-detect file type (image, video, pdf, etc.)
        });

        // Log success message with uploaded file URL
        console.log("File uploaded to Cloudinary:", response.url);

        // ✅ IMPORTANT: delete local file after successful upload
        fs.unlinkSync(localFilePath);

        // Return full Cloudinary response (contains url, public_id, etc.)
        return response;

    } catch (error) {
        // ❗ If upload fails, delete the local file (cleanup)
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // Log error for debugging
        console.error("Cloudinary upload failed:", error);

        return null;
    }
};

// Export function to use in routes/controllers
export { uploadCloudinary };