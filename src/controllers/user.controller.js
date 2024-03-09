import ApiErrors from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
 
const registerUser = asyncHandler(async(req, res, next) => {
    // get user details from frontens
    const {username, password, email, fullName} = req.body;


    // validation - not empty
    if ([username, password, email, fullName].some((field) => field?.trim() == "")) {
        throw new ApiErrors(401, "* marked field are required");
    }

    // check if user alrady exists: username, email
    const existingUser = await User.findOne({$or: [{username}, {email}]});
    if (existingUser) {
        throw new ApiErrors(402, "user is already exist");
    }
    
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    let avatarFilePath = null;
    let avatarUploadedSuccess = null;

    let coverImageFilePath = null;
    let converUploadedSuccess = null;

    if (req.files && Array.isArray(req.files.coverImage)) {
        coverImageFilePath = req.files.coverImage[0].path;
        converUploadedSuccess =  await uploadCloudinary(coverImageFilePath);
        if (!converUploadedSuccess) {
            throw new ApiErrors(500, "Error from server while uploading file")
        }
    }

    console.log(req.files);

    if (req.files && Array.isArray(req.files.avatar)) {
        avatarFilePath = req.files.avatar[0].path;
        avatarUploadedSuccess =  await uploadCloudinary(avatarFilePath);
        if (!avatarUploadedSuccess) {
            throw new ApiErrors(500, "Error from server while uploading file")
        }
    }

    if (!avatarFilePath && !avatarUploadedSuccess) {
        throw new ApiErrors(201, "avatar image is required");
    }

    // create user object - create entry in db
    const userCreate = await User.create({
        username: username.toLowerCase(),
        password, email, fullName,
        avatar: avatarUploadedSuccess.url,
        coverImage: converUploadedSuccess?.url || ""
    });

    // check for user creationf
   const userCreatedResponse = await User.findById(userCreate._id).select("-password -refreshToken");

   // remove password and refresh token field from response
   if (!userCreatedResponse) {
    throw new ApiErrors(500, "Error from server while creating user")
   }

   // return response
   return res.status(200).json(new ApiResponse(200, userCreatedResponse));
})

export {registerUser};