//creates a method and exports it

const asyncHandler= (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
// promise incoke,  resolve and catch

export {asyncHandler};



