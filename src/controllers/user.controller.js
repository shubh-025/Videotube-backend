import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const registerUser = asyncHandler(async (req, res) => {

  // 1. get user details from frontend
  const { username, email, fullname, password } = req.body;
  // console.log("email: ", email);

  // 2. validation - not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ){
    throw new ApiError(400, "all fields are required")
  }

  // 3. check if user already exist(from username & email)
  const existedUser = await User.findOne({
    $or: [{ username },{ email }]
  })

  if(existedUser) {
    throw new ApiError(409, "User with email or username already existed")
  }
  //console.log(req.files);
  

  // 4. check for images, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }

  // 5. if images available upload them to cloudinary, 
  const avatar = await uploadCloudinary(avatarLocalPath)
  const coverImage = await uploadCloudinary(coverImageLocalPath)

  // 6. check if avatar uploaded
  if(!avatar){
    throw new ApiError(400,"avatar is required")
  }

  // 7. create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // 8. check for user creation & remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user")
  }
  
  // 9. if created return res
  return res.status(201).json(
     new ApiResponse(201, createdUser, "User registered Successfully")
  )

  // else return error
});

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
  
    // saving refresh token for that user in our database
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "something went wrong while generating refresh and access token")
  }
}


const loginUser = asyncHandler(async (req,res) => {
  // 1. bring data from req body
  const {email, username, password} = req.body

  // 2. username or email
  if(!username && !email) {
    throw new ApiError(401, "username or email is required")
  }

  // 3. find the user
  const loginUser = await User.findOne({
    $or: [{username},{email}]
  })

  if(!loginUser){
    throw new ApiError(404,"user doesnt exist")
  }

  // 4. if user found check his password
  const isPasswordValid = await loginUser.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"wrong password")
  }

  // 5. if correct pass , generate access and refresh token ang give to user
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(loginUser._id)

  // 6. send cookies
   const user = await User.findById(loginUser._id).
   select("-password -refreshToken")

   const options = {
    httpOnly: true,
    secure: true
   }

   return res.
   status(200).
   cookie("accessToken",accessToken,options).
   cookie("refreshToken",refreshToken,options).
   json(
    new ApiResponse(
      200, 
      {
        user: user, accessToken, refreshToken
      },
      "user logged in successfully"
    )
   )

  // what i WROTE
  // take username and password from user 
  // verify and give a access token to user and a refresh token
  // when access token expires check with refresh token 
})


const logoutUser = asyncHandler(async(req,res) => {
  // we will need middleware to get user id to logout
  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  
  const options = {
    httpOnly: true,
    secure: true
   }

   return res.
   status(200).
   clearCookie("accessToken", options).
   clearCookie("refreshToken",options).
   json(new ApiResponse(200,{},"user logged out"))

})

const refreshAccessToken = asyncHandler( async (req,res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
  throw new ApiError(401,"unauthorized request")
 }

try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
      throw new ApiError(401, "invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
    }
  
    const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res.
    status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",newrefreshToken,options).
    json(new ApiResponse(
      200,
      {accessToken, refreshToken: newrefreshToken},
      "access token refreshed"
    ))
  
} catch (error) {
  throw new ApiError(404,error?.message || "invalid refresh token")
}
})

const changeCurrentPassword = asyncHandler(async (req,res) => {
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect) {
    throw new ApiError(400,"invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res.
         status(200).
         json( new ApiResponse(200,{},"password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req,res) => {
  return res.status(200).
        json(200,req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullname, email} = req.body

  if(!fullname || !email){
    throw new ApiError(400, "all fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).
            json(new ApiResponse(200,user,"account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is missing")
  }

  const avatar = await uploadCloudinary(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiError(400,"error while uploading avatar on cloudinary")

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url
        }
      },
      {new: true}
    ).select("-password")
  }

   return res.status(200).
              json(new ApiResponse(200,user,"avatar image updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req,res) => {
  const coverLocalPath = req.file?.path

  if(!coverLocalPath){
    throw new ApiError(400,"cover image file is missing")
  }

  const coverImage = await uploadCloudinary(coverLocalPath)

  if(!coverImage.url) {
    throw new ApiError(400,"error while uploading cover on cloudinary")

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url
        }
      },
      {new: true}
    ).select("-password")
  }

  return res.status(200).
              json(new ApiResponse(200,user,"cover Image image updated successfully"))


})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};



















// not importing middle ware but can still use it
// why do we write req,res in every function and what values do these hold and how they get these values
// what are cookies and what information does they hold are they only in user's browser or backend as well and what is this cookie parser and what it do basically 
// how are we getting access token in the auth middleware and explain the exact logic to me how are we implementing the logot internally 
// what are these options and what are they doing 
// how req.user i was able to use it in controller even though i didnt import it from the auth middleware
// why do we use next in async handler and especially with middle ware is there something special about them 
// in models when we wrote generate tokens and here when we wrote tokens what exactly is the difference bw these two 
// basically i am unable to understand how information and data is flowing between various files 


// when user is logged in then does the req has .user cause i noticed req gets .user only when logout is hit , so while updating password can we use req.user or not 
// when any file comes in req does multer automatically stores it in public/temp 