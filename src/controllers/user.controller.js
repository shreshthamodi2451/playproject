import { asyncHandler } from "../utils/asyncHandler.js"

// A controller is a function that receives an API request, performs the required business logic, and sends a response.

// Think of it as the manager of an API endpoint.

const registerUser= asyncHandler( async(req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export  {registerUser};