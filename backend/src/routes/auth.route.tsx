import {Router} from "express"
import { loginController, RegisterController } from "../controllers/auth.controller.js"

const authRoutes = Router()

authRoutes.post("/register", RegisterController)
authRoutes.post("/login", loginController )

export default authRoutes