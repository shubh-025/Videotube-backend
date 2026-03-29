/**
 * 🚀 Express App Setup (app.js)
 *
 * This file creates and configures the Express app.
 * It sets up middleware to:
 * - Handle security (CORS)
 * - Read incoming request data (JSON, forms)
 * - Serve static files
 * - Work with cookies
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


// 1️⃣ CORS (Cross-Origin Resource Sharing)
// Allows frontend (running on a different URL) to call this backend
app.use(cors({
    origin: process.env.CORS_ORIGIN, // only allow this frontend
    credentials: true                // allow cookies to be sent
}));


// 2️⃣ BODY PARSING (reading request data)

// Parse JSON data (used in APIs, e.g., React sending data)
app.use(express.json({
    limit: "16kb" // prevents very large requests (basic security)
}));

// Parse URL-encoded data (used in HTML form submissions)
app.use(express.urlencoded({
    extended: true, // allows nested objects (recommended)
    limit: "16kb"
}));


// 3️⃣ STATIC FILES
// Makes files inside "public" folder accessible via browser
// Example: /logo.png → public/logo.png
app.use(express.static("public"));


// 4️⃣ COOKIE PARSER
// Lets us read cookies sent by the browser (available in req.cookies)
app.use(cookieParser());


// 🧠 Middleware Concept:
// Middleware are functions that run between request → response
// app.use() is used to add them to the request flow

export { app };