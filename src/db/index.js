/**
 * 🔌 Database Connection (MongoDB)
 *
 * This function connects our app to MongoDB using Mongoose.
 * It ensures:
 * - Successful connection before app runs
 * - Proper error handling if connection fails
 */

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Connect using URI + database name
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        // Log success with DB host info (useful for debugging)
        console.log(
            `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );

    } catch (error) {
        // If connection fails → log error and stop the app
        console.error("MongoDB connection FAILED:", error);
        process.exit(1); // exit with failure code
    }
};


// Export function so it can be used in index.js
export default connectDB;