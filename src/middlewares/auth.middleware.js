//verify if user exits or not
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT= asyncHandler(async(req, res, next) => {
    try {
        const token= req.cookies?.accessToken || req.header("Authorisation")?.replace("Bearer ","")
    
    
        if(!token)
            throw new ApiError(401, "unauthorized! token is missing")
    
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
            throw new ApiError(401, "invalid access token")
    
        req.user= user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "inavlid access token")
    }


})
//this middleware is used to verify the jwt token sent by the user in the request header or cookies, if the token is valid then the user is authenticated and can access the protected routes, otherwise the user is not authenticated and cannot access the protected routes. so we need to verify the jwt token sent by the user in the request header or cookies, if the token is valid then the user is authenticated and can access the protected routes, otherwise the user is not authenticated and cannot access the protected routes. we can get the token either by cookies or by header, so we check if the token is present in the cookies or in the header, if it is present in the cookies then we get it from the cookies, otherwise we get it from the header. we also need to remove the "Bearer " prefix from the token if it is present in the header, so we use the replace method to remove the "Bearer " prefix from the to