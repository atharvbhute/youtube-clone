import { User } from "../models/user.model";
import ApiErrors from "../utils/apiErrors";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

// this middleware will verify if user us Authurized and can be used wherever need authorsation. 
const verifyUserByJwt = asyncHandler(async (req, _, next) => {
    const accessToken = req.cookie?.accessToken || req.header("Authorization")?.relace("Bearer ", "");
    if(!accessToken){
        throw new ApiErrors(401, "Unauthorised request");
    }

    const decodedJwt = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
    const user = await User.findById(decodedJwt?._id).select("-password, -refreshToken") // ;

    if (!user) {
        throw new Error(401, "invalid access token");
    }

    req.user = user;
    next();
});

export default verifyUserByJwt;