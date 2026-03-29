/**
 * ✅ Custom API Response Class
 *
 * Purpose:
 * Standardizes all successful responses sent from the server.
 * Ensures every response has the same structure.
 */

class ApiResponse {
    constructor(
        statusCode,            // HTTP status code (e.g., 200, 201)
        data,                  // actual response data (user, list, etc.)
        message = "Success"    // optional message
    ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;

        // success = true for status < 400, false otherwise
        this.success = statusCode < 400;
    }
}

export { ApiResponse };