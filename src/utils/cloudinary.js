import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
console.log("CLOUDINARY LOADED");



const uploadOnCloud = async (localFilePath) => {
    console.log({
        cloud: process.env.CLOUDINARY_CLOUD_NAME,
        key: process.env.CLOUDINARY_API_KEY,
        secret: !!process.env.CLOUDINARY_API_SECRET
    });

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // rest of your upload code...
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfuly
        //console.log("file is uploaded successfully", response.url);
        fs.unlinkSync(localFilePath); //remove the locally saved temp files as the upload operation is successful
        return response;
    }catch(error)
    {
        //unlink
        fs.unlinkSync(localFilePath); //remove the locally saved temp files as the uload operation got failed
        console.log("Cloudinary Error:", error);
        return null;
    }
}






export {uploadOnCloud}