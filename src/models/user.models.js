import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Optimized for high-speed database searching
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // URL from Cloudinary storage [cite: 672]
      required: true,
    },
    coverImage: {
      type: String, // URL from Cloudinary storage
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // Reference to the Video collection
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String, // Stored to allow session persistence
    },
  },
  { timestamps: true }
); // Automatically creates createdAt and updatedAt fields

/**
 * PRE-SAVE HOOK: Encrypts password before saving to the database.
 * Only runs if the password field is modified.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * INSTANCE METHOD: Validates the plain text password against the hashed version.
 */
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * INSTANCE METHOD: Generates a short-lived Access Token for authentication.
 * Payload includes essential user details for quick retrieval. it keeps moving back and forth on every like,comment,etc
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

/**
 * INSTANCE METHOD: Generates a long-lived Refresh Token to renew sessions.
 * Payload only contains the user ID to keep it lightweight. stays in the db , one token for one user and refreshes the access token when that gets expired
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
