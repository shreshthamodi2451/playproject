import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// A controller is a function that receives an API request, performs the required business logic, and sends a response.

// Think of it as the manager of an API endpoint.

const registerUser= asyncHandler( async(req, res) => {
    //write what you want how you want it to work, logic building
    // get user details from frontend
    //validation- not empty
    //check if user already exists: username and email
    //check for images, check for avatar
    //upload them to cloudinary, got response thne get url from that response, avatar
    //create user object- create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    //data coming from form and json comes in req.body
    const {fullName, email, usernmame, password}= req.body
    console.log("email: ", email);

    //  if(fullName == "")
    //  {
    //     throw new ApiError(400, "full name is req")
    //  }
     //validation 
    if (
    [fullName, email, username, password].some(
        (field) => field?.trim() === ""
    )
    ) {
    throw new ApiError(400, "All fields are required");
     }


     //check i user exists
     const existerUser= User.findOne({
        $or: [
            {usernmame}, {email}
        ]
     })

     if(existerUser)
        throw new ApiError(409, "user wid email or usernamealready exists");

     //for multer middleware
     const avatarLocalPath= req.files?.avatar[0]?.path;

     const coverImageLocalPath= req.files?.coverImage[0]?.path;

     if(!avatarLocalPath)
        throw new ApiError(400, "avatar file is req");

     //upload them to cloudinary
    const avatar= await uploadOnCloud(avatarLocalPath);

    const coverImage= await uploadOnCloud(coverImageLocalPath);

     if(!avatar)
        throw new ApiError(400, "avatar file is req");
    
     const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: usernmame.toLowerCase()
     }
     )

      const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser)
        throw new ApiError(500, "something went wrong while registering the user");

      return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully!")
      )

})

export  {registerUser};