import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))    // .use is used for middleware
// cors = cross origin resource sharing

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser()) // used to read the cookies and change them in users browser

// middleware is when we do some functions bw two operations (before giving any response to request check user is login or check if user is admin etc etc)

export { app }