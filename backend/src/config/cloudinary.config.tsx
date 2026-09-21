import { v2 as cloudinary } from 'cloudinary'
import { Env } from './env.config.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from "multer"

cloudinary.config({
    cloud_name : Env.CLOUDINARY_CLOUD_NAME,
    api_key : Env.CLOUDINARY_API_KEY,
    api_secret : Env.CLOUDINARY_API_SECRET,
})

const STORAGE_PARAMS = {
    folder: "images",
    allowed_formats : ['jpg', 'jpeg', 'png', 'webp',],
}

const storage = new CloudinaryStorage({

    cloudinary,
    params:( req, file ) =>({
        ...STORAGE_PARAMS,
    })
})

export const upload = multer({
    storage,
    limits: { fileSize : 2 * 1024 * 1024, files:1 },
    fileFilter : (_,file, cb) =>{
        const isValid = /^image\/(jpg|png|jpeg|webp)$/.test(file.mimetype)

        if(isValid){
            cb(null, true)
        }
        else{
            cb(new Error(`Unsupported file type: ${file.mimetype}`))
        }
    },
})

// https://console.cloudinary.com/app/c-c575fc90ff89ee00da7b6d4c62198b/image/getting-started
// https://www.npmjs.com/package/multer-storage-cloudinary