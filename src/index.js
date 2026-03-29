/**
 * 🚀 Entry Point
 * - Load env variables
 * - Connect to DB
 * - Start server (only if DB connects)
 */

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"; 


// Load environment variables from .env
dotenv.config({ path: './.env' });


// Connect to DB → then start server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });

        // Handle runtime app errors
        app.on("error", (error) => {
            console.error("App error:", error);
            throw error;
        });
    })
    .catch((err) => {
        // If DB fails, stop the app
        console.error("DB connection failed:", err);
        process.exit(1);
    });





/*
--- Alternative (IIFE approach) ---
- Works fine for small apps
- Not ideal for larger projects (less modular)

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) => {
            console.error("App error:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Init error:", error);
        throw error;
    }
})();
*/