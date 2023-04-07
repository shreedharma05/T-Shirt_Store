const app = require('./app');
const connectwithDB = require('./config/db');
require('dotenv').config()
const cloudinary = require('cloudinary')

// connect with DB
connectwithDB()

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(process.env.PORT, () => {
    console.log(`The server is running at port: ${process.env.PORT}`);
})

