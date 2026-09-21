import {Router} from "express"
import { loginController, RegisterController } from "../controllers/auth.controller.js"
import { getCurrentUserController, updateUserController } from "../controllers/user.controller.js"
import { upload } from "../config/cloudinary.config.js"

const userRoutes = Router()

userRoutes.post("/current-user", getCurrentUserController)
userRoutes.put("/update", upload.single("profilePicture"), updateUserController )

export default userRoutes