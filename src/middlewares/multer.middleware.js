// Import multer (used to handle file uploads from client)
import multer from "multer";

// Configure how and where files will be stored
const storage = multer.diskStorage({

  // 📁 Folder where uploaded files will be saved
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  // 🏷️ Name of the saved file
  filename: function (req, file, cb) {

    // Add a unique suffix to avoid overwriting files with same name
    const uniqueSuffix = Date.now();

    // Final filename = timestamp + original file name
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// Create multer middleware using the above storage config
export const upload = multer({
  storage
});