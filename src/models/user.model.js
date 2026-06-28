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



userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password, 10)
    next();
});

//methods, we have used this.password to access the current instance of the user document and compare it with the provided password using bcrypt.compare method, which returns a boolean indicating whether the passwords match or not. this.password is the current hashed password because we have hashed it in the pre save middleware, so we can compare it with the provided password to check if they match or not. so basically once we hash it the instance of the user document will have the hashed password and we can use it to compare with the provided password.
userSchema.methods.isPasswordCorrect= async function (password) {
    return await bcrypt.compare(password, this.password)
}

//jwt is a bearer token, whoever sends this token backend will send it the data
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