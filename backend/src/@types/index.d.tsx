import type { UserDocument } from "../models/user.model.js";

declare global {
    namespace Express {

        interface User extends UserDocument{
            _id ?: any
        }
    }
}