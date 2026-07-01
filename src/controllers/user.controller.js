import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// A controller is a function that receives an API request, performs the required business logic, and sends a response.

// Think of it as the manager of an API endpoint.

   //make access or refresh token

const generateAccessAndRefreshToken= async(userId) => {
   try {
      const user= await User.findById(userId)
      const accessToken= user.generateAccessToken();
      const refreshToken= user.generateRefreshToken();

      user.refreshToken= refreshToken
      
      await user.save({validateBeforeSave: false})

      return{accessToken, refreshToken}

   } catch (error) {
      console.error("Original Error:", error);
      throw new ApiError(500, "something went wrong while generating refresh and access token")
   }
}

const registerUser= asyncHandler( async(req, res) => {

   //console.log(req.files);
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
    const {fullname, email, username, password}= req.body
    console.log("email: ", email);

    //  if(fullName == "")
    //  {
    //     throw new ApiError(400, "full name is req")
    //  }
     //validation 
    if (
    [fullname, email, username, password].some(
        (field) => field?.trim() === ""
    )
    ) {
    throw new ApiError(400, "All fields are required");
     }


     //check i user exists
     const existerUser= await User.findOne({
        $or: [
            {username}, {email}
        ]
     })

     if(existerUser)
        throw new ApiError(409, "user wid email or username already exists");

     //for multer middleware
     const avatarLocalPath= req.files?.avatar[0]?.path;

     //const coverImageLocalPath= req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if(req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
}

     if(!avatarLocalPath)
        throw new ApiError(400, "avatar file is req");

     //upload them to cloudinary
    const avatar= await uploadOnCloud(avatarLocalPath);

    console.log("Cloudinary Response:", avatar);

    const coverImage= await uploadOnCloud(coverImageLocalPath);

     if(!avatar)
        throw new ApiError(400, "avatar file is req");
    
     const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
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


const loginUser= asyncHandler( async(req,res) => {
   //get email and password from register
   //validate correct user/email 
   //find user
   //password check
   //access and refresh token generated and sent to user
   //send cookie
   //send response
   //if not registered the register button

   const {email, username, password}= req.body

   if(!(username || email))
      throw new ApiError(400, "username or email is required")
   

   const user= await User.findOne({
      $or: [{username},{email}]
   })

   if(!user)
      throw new ApiError(404, "user does not exist")

   const isPasswordvalid = await user.isPasswordCorrect(password)

   if(!isPasswordvalid)
      throw new ApiError(404, "wrong password")

   const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)


   const loggedUser= await User.findById(user._id).select("-password -refreshToken")

   //send to cookies
   const options= {
      httpOnly: true,
      secure: true
   } //can only be modified by server and not by frontend

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedUser, accessToken, refreshToken
         },
         "user logged in successfully!"
      )
   )


})

const logoutUser= asyncHandler(async(req, res) => {


   console.log("Logging out user:", req.user._id);
   //logout middleware
   const updatedUser= await User.findByIdAndUpdate(req.user._id,
      {
         $set: {
            refreshToken: null
         }
      },
      {
         new: true
      }
   )
   console.log(updatedUser);
   const options= {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "user logged out successfully!"))
})

const refreshAccessToken= asyncHandler(async(req, res) => {
   //can be accessed by cookies
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorised req")
  }

  try {
   const decodedToken= jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
   )
 
   const user= await User.findById(decodedToken?._id)
 
   if (!user) {
       throw new ApiError(401, "invalid refresh token")
   }
 
   if(incomingRefreshToken !== user?.refreshToken)
   {
    throw new ApiError(401, "refresh token is expiered or used")
   }
 
   const options={
    httpOnly: true,
    secure: true
   }
 
   const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", newRefreshToken, options)
   .json(
    new ApiResponse(
       200,
       {accessToken, refreshToken: newRefreshToken},
       "access token refreshed"
    )
   )
  } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token")
  }


})

const changeCurrentPassword= asyncHandler(async(req, res) => {
   const {oldPassword, newPassword} = req.body;

   // if able to change passowrd means user is logged in, so middleware auth has run and so req.user has user

   const user= User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password= newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "password chnaged suc cessfully!"))
})

const getCurrentUser= asyncHandler(async (req,res) => {
   //const currentUser= await User.findById(req.user?._id);

   return res
   .status(200)
   .json(200, req.user, "curret user fetched succesful")
})

const updateAccountDetails= asyncHandler(async(req,res) =>{
   const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    } //if fullname or email is missing throw an error

    const user= User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname,
            email: email
         }
      },
      {new: true }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//to update files, add multer middleware, check if user is logged in so check if user is authenticated
const updateUserAvatar= asyncHandler(async(req, res) =>{
   //get files through multer middleware and .file coz only one file 
   const avatarLocalPath= req.file?.path

   if(!avatarLocalPath)
      throw new ApiError(400, "avatar file is missing")

   const avatar= await uploadOnCloud(avatarLocalPath)

   if(!avatar.url)
      throw new ApiError(400, "error while uploading on avatar")

   const user= await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new: true}
   ).select("-password")

   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage= asyncHandler(async(req, res) =>{
   //get files through multer middleware and .file coz only one file 
   const coverImageLocalPath= req.file?.path

   if(!coverImageLocalPath)
      throw new ApiError(400, "coverImage file is missing")

   const coverImage= await uploadOnCloud(coverImageLocalPath)

   if(!coverImage.url)
      throw new ApiError(400, "error while uploading on coverImage")

   const user= await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {new: true}
   ).select("-password")

   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "cover image image updated successfully")
    )
})


export  {registerUser, 
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage
};

