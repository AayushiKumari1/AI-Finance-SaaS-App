import { UserModel } from "../models/user.model.js"
import { NotFoundException } from "../utils/app_error.js"
import type { UpdateUserType } from "../validators/user.validator.js"

export const findByIdUserService = async(userId : string ) =>{

    const user = await UserModel.findById(userId)
    return user ?.omitPassword()
}

export const updateUserService = async( userId: string, body: UpdateUserType, profilePic?: Express.Multer.File | null )=>{

    const user = await UserModel.findById(userId)

    if( !user ) throw new NotFoundException("User Not Found.")

    if( profilePic ){
        user.profilePicture = profilePic.path
    }

    user.set({
        name: body.name,
    })

    await user.save()

    return user.omitPassword()
}