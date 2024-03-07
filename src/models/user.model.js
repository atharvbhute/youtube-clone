import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Jwt } from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowecase: true,
      trim: true,
      inedex: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    email: {
      type: String,
      require: [true, "email is required"],
      unique: [true, "Email already exist"],
      trim: true,
      lowecase: true,
    },

    fullName: {
      type: String,
      trim: true,
      required: [true, "name is required"],
      index: true,
    },
    avatar: {
      type: String,
      unique: true,
    },

    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    next();
  }
}); // here we have used middleware which executes before saving something into database 
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}; //here we have assigned a custome method to check if the password that user gave is correct or not.

userSchema.method.generateAccessToken = function () {
    return token = Jwt.sign({
        _id : this._id,
        username: this.username,
        email: this.email,
        fullName : this.fullName
    }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

userSchema.method.generateRefreshToken = function () {
    return token = Jwt.sign({
        _id : this._id,
    }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

export const User = mongoose.model("User", userSchema);
