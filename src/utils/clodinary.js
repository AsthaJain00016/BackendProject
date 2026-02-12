import { v2 as cloudinary } from "cloudinary";
import fs from 'fs' // fs means file system

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, resourceType = null) => {
    try {
        if (!localFilePath) return null
        // detect resource type if not provided
        const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        if (!resourceType) {
            const lower = localFilePath.toLowerCase();
            resourceType = videoExts.some(ext => lower.endsWith(ext)) ? 'video' : 'image';
        }
        // upload the file on cloudinary with correct resource type
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType
        })
        // file has been uploaded successfully 
        // console.log(`File has been uploaded successfully on cloudinary`,response.url);

        if(fs.existsSync(localFilePath)){
        fs.unlinkSync(localFilePath)}
        return response;
        } catch (error) {
             if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error
        }  
}


const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"   // Important: videos are not images
        });
        return result; // usually { result: 'ok' }
    } catch (error) {
        throw new Error("Error deleting file from Cloudinary: " + error.message);
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }