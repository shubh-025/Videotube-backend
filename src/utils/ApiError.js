/**
 * ❌ Custom API Error Class
 *
 * This class standardizes how errors are handled in the app.
 * Instead of throwing random errors, we use this to send
 * structured error responses (status, message, etc.).
 */

class ApiError extends Error {
    constructor(
        statusCode,                 // HTTP status code (e.g., 404, 500)
        message = "Something went wrong", // default error message
        errors = [],                // optional detailed errors (array)
        stack = ""                  // optional custom stack trace
    ){
        super(message); // call parent Error class

        this.statusCode = statusCode;
        this.data = null;     // no data in error response
        this.message = message;
        this.success = false; // always false for errors
        this.errors = errors; // extra error details

        // Handle stack trace (use custom or auto-generate)
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };