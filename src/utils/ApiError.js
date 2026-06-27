// Create a custom error class by extending JavaScript's built-in Error class.
class ApiError extends Error {

    // This constructor runs whenever you do: new ApiError(...)
    constructor(
        statusCode,                          // HTTP status code (404, 401, 500, etc.)
        message = "Something went wrong",    // Default error message
        errors = [],                         // Array of detailed errors (optional)
        stack = ""                           // Optional custom stack trace
    ) {

        // Call the parent (Error) constructor to initialize the built-in Error object.
        super(message);

        // Store the HTTP status code inside the error object.
        this.statusCode = statusCode;

        // No data is returned when an error occurs.
        this.data = null;

        // Store the error message.
        this.message = message;

        // Every ApiError represents a failed request.
        this.success = false;

        // Store any additional validation or error details.
        this.errors = errors;

        // If a custom stack trace was provided...
        if (stack) {

            // ...use the provided stack trace.
            this.stack = stack;

        } else {

            // Otherwise generate a stack trace automatically.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the class so other files can import and use it.
export { ApiError };