import { Router } from "express";
import { loginUser, logoutUser, registerUser, updateAccessToken, getWatchHistory, updatePassword,updateUserInfo, getCurrentUser
, getUserChannelInfo } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyUserByJwt from "../middlewares/auth.middleware.js"

const userRouter = Router();

userRouter.route("/register").post(upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "coverImage", maxCount: 1}
]),registerUser);

userRouter.route("/login").post(loginUser);
userRouter.route("/channel/:username").get(getUserChannelInfo);

// secured routes
userRouter.route("/logout").post(verifyUserByJwt, logoutUser);
userRouter.route("/updateAccessToken").post(updateAccessToken);
userRouter.route("/changePassword").post(verifyUserByJwt, updatePassword);
userRouter.route("/updateUserInfo").patch(verifyUserByJwt,upload.fields([{name: "avatar", maxCount:1}, {name: "coverImage", maxCount:1}]),updateUserInfo);
userRouter.route("/getCurrentUser").post(verifyUserByJwt, getCurrentUser);
userRouter.route("/watchHistory").get(verifyUserByJwt,getWatchHistory);

export {userRouter};