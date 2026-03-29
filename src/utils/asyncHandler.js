/**
 * ⚡ Async Handler Utility
 *
 * Purpose:
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error middleware (next).
 *
 * Without this → we need try-catch in every controller ❌
 * With this → clean and reusable code ✅
 */

const asyncHandler = (requestHandler) => {
    // Return a middleware function (req, res, next)
    return (req, res, next) => {
        // Ensure any error in async function is caught
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // forward error to Express
    };
};

export { asyncHandler };



/**
 * 📌 Understanding the commented variations below:
 */

// 1️⃣ Basic idea (empty wrapper)
// const asyncHandler = () => {}
// → Just a placeholder, no functionality


// 2️⃣ Higher-order function (function returning function)
// const asyncHandler = (func) => () => {}
// → Shows concept: wrap a function and return another function


// 3️⃣ Async wrapper (more realistic structure)
// const asyncHandler = (func) => async () => {}
// → Indicates wrapper will handle async functions


// 4️⃣ Try-catch approach (alternative implementation)
//
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// }
//
// 🔍 Explanation:
// - Wraps controller in try-catch
// - Sends response directly on error
//
// ⚠️ Why it's less preferred:
// - Bypasses centralized error handling middleware
// - Repeats response logic (not scalable)
//
// ✅ Current (Promise-based) approach is better because:
// - Passes errors to global error handler using next()
// - Keeps error handling consistent across app