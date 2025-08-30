require('dotenv').config();

const config = {
    // MongoDB
    mongodb: {
        uri: process.env.MONGODB_URI
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '50m'
    },

    // Server
    server: {
        port: process.env.PORT || 3000,
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
    },

    // Google Sheets
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        sheetId: process.env.GOOGLE_SHEET_ID
    },

    // Resend Email Service
    resend: {
        apiKey: process.env.RESEND_API_KEY
    },

    // Cloudinary
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};

module.exports = config; 