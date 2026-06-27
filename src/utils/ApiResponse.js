// Create a class to standardize successful API responses.
class ApiResponse {

    // This constructor runs whenever you do: new ApiResponse(...)
    constructor(statusCode, data, message = "success") {

        // Store the HTTP status code (200, 201, etc.).
        this.statusCode = statusCode;

        // Store the actual data that will be sent to the client.
        this.data = data;

        // Store a success message.
        this.message = message;

        // If status code is less than 400, mark the request as successful.
        this.success = statusCode < 400;
    }
}