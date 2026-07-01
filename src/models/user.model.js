import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema= new Schema(
    {

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, //to enable searching
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String
        },
    }, 
    {
        timestamps: true
    }
)

// a fucntion we run just before saving the data

//middleware
//in this we have not used arrow function because we want to use this keyword which is not available in arrow function, as we want to access and hash the current password of the user before saving it to the database, we need to use a regular function so that we can access the current instance of the user document using this keyword.


//pre is used here because we want to hash the password before saving it to the database, so we use pre save middleware to hash the password before saving it to the database. if we use post save middleware then the password will be saved in plain text and then we will hash it which is not what we want. so we use pre save middleware to hash the password before saving it to the database.
userSchema.pre("save", async function () {

    if(!this.isModified("password")) return;

    this.password=await bcrypt.hash(this.password, 10)
    // next();
});

//methods, we have used this.password to access the current instance of the user document and compare it with the provided password using bcrypt.compare method, which returns a boolean indicating whether the passwords match or not. this.password is the current hashed password because we have hashed it in the pre save middleware, so we can compare it with the provided password to check if they match or not. so basically once we hash it the instance of the user document will have the hashed password and we can use it to compare with the provided password.
userSchema.methods.isPasswordCorrect= async function (password) {
    return await bcrypt.compare(password, this.password)
}

//jwt is a bearer token, whoever sends this token backend will send it the data
//access token is a short lived token which is used to access the protected routes, it is sent in the authorization header of the request, !!!and it is verified by the backend to check if the user is authenticated or not.!!! if the token is valid then the user is authenticated and can access the protected routes, otherwise the user is not authenticated and cannot access the protected routes. so we generate an access token for the user when he logs in or registers, and send it to the frontend, which will store it in local storage or cookies and send it in the authorization header of the request to access the protected routes. so we need to generate an access token for the user when he logs in or registers, and send it to the frontend, which will store it in local storage or cookies and send it in the authorization header of the request to access the protected routes.
userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//refresh token is a long lived token which is used to generate a new access token when the access token expires, it is sent in the authorization header of the request, and it is verified by the backend to check if the user is authenticated or not. if the token is valid then the user is authenticated and can generate a new access token, otherwise the user is not authenticated and cannot generate a new access token. so we generate a refresh token for the user when he logs in or registers, and send it to the frontend, which will store it in local storage or cookies and send it in the authorization header of the request to generate a new access token when the access token expires. so we need to generate a refresh token for the user when he logs in or registers, and send it to the frontend, which will store it in local storage or cookies and send it in the authorization header of the request to generate a new access token when the access token expires.
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User= mongoose.model("User", userSchema);