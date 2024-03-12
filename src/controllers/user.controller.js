import ApiErrors from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import Jwt from "jsonwebtoken"
 
const registerUser = asyncHandler(async(req, res, _) => {
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
});


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiErrors(500, "server failed to generate access token");
    }
}

const loginUser = asyncHandler(async (req, res, _)=> {
    // get data from body
    const {username, email, password} = req.body;
    if (!(username || email)) {
        throw new ApiErrors(401, "Email or username is required");
    }
    // find the user
    const user = await User.findOne({
        $or: [{username}, {password}]
    }).select();


    if (!user) {
        throw new ApiErrors(404, "user does not exist");
    }

    //password check
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    
    if (!isPasswordCorrect) {
        throw new ApiErrors(402, "Password is incorrect");
    }
    // access and refresh token
    const tokens = await generateAccessAndRefreshToken(user._id);
    // send token in cokies
    const {accessToken, refreshToken} = tokens;
    const options = { // to modify cookies from server only and not from frontend
        httpOnly: true,
        secure: true
    }
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "user is logged in"));
    
    // above we have to send accessToken and refresh tokens in response if developer wants to save it in App and login through mobile app
    // in case of mobile app there is no coockie so dev can save it in storage. 
});

const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { $set: {refreshToken: undefined} }, {new: true}); // third is optional to give response with updated info;
    const options = { // to modify cookies from server only and not from frontend
        httpOnly: true,
        secure: true
    }

    res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));

});

const updateAccessToken = asyncHandler(async (req, res, next) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.relace("Bearer ", "");
    if (!incommingRefreshToken) {
        throw new Error(201, "refreshToken not recieved");
    }

    const decodedToken = await Jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_KEY);
    if (!decodedToken) {
        throw new ApiErrors(500, "failed to validate token");
    } 

    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiErrors(500, "user not found");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    const options = { // to modify cookies from server only and not from frontend
        httpOnly: true,
        secure: true
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "user is logged in"));
    
})

export {registerUser, loginUser, logoutUser, updateAccessToken};