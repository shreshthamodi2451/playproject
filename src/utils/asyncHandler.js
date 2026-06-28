//creates a method and exports it

const asyncHandler= (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
// promise incoke,  resolve and catch

export {asyncHandler};



// //with asynchandler i dont have to write try catch in my controllers Controller

// ↓

// Error

// ↓

// asyncHandler catches it

// ↓

// Express Error Middleware

// ↓

// Proper JSON response

// const registerUser = asyncHandler(async (req, res) => {

//     // Your code

// });
// **asyncHandler is a wrapper function that automatically catches errors thrown inside asynchronous Express route handlers and forwards them to Express's error-handling middleware using next(error), eliminating the need to write try...catch in every controller.`