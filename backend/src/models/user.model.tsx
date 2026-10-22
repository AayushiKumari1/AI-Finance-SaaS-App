// import mongoose, { Schema, type Document } from "mongoose";
// import { compareValue, hashValue } from "../utils/bycrpt.js";

// export interface UserDocument extends Document{

//     name : string
//     email : string
//     password : string
//     profilePicture : string
//     createdAt : Date
//     updatedAt : Date
//     comparePassword : ( password : string ) => Promise<boolean>
//     omitPassword: () => Omit<UserDocument, 'password'>
// }

// const userSchema = new Schema<UserDocument>({

//     name : {

//         type : String,
//         required : true,
//         trim : true,
//     }, 
//     email : {
//         type : String,
//         required : true,
//         unique : true,
//         trim : true,
//         lowercase : true,
//     },
//     profilePicture:{
//         type:String,
//         default:null,
//     },
//     password : {

//         type : String,
//         select : true,
//         required : true,
//     }
// },
//     {
//         timestamps : true,
//     }
// )

// userSchema.pre( "save", async function( next ){

//     if( this.isModified("password") ){

//         if( this.password ){

//             this.password = await hashValue( this.password )
//         }
//     }
//     next()
// } )

// userSchema.methods.omitPassword = function () : Omit<UserDocument, "password">
// {

//     const userObject = this.toObject()
//     delete userObject.password
//     return userObject
// }

// userSchema.methods.comparePassword = async function ( password : string ){

//     return compareValue( password, this.password )
// }

// export const UserModel = mongoose.model<UserDocument>("User", userSchema)

// /* 
//     UserDocument - interface	Tells TypeScript what a User document looks like
//     userSchema - Tells Mongoose how the data should be stored/validated
//     userModel - Gives you methods to interact with MongoDB
// */


import mongoose, { Schema, type Document } from "mongoose";
import { compareValue, hashValue } from "../utils/bycrpt.js";

export type SubscriptionPlan = "FREE" | "PRO"
export type SubscriptionStatus =
    | "none"
    | "created"
    | "authenticated"
    | "active"
    | "pending"
    | "halted"
    | "cancelled"
    | "completed"
    | "expired"

export interface UserDocument extends Document{

    name : string
    email : string
    password : string
    profilePicture : string
    subscriptionPlan : SubscriptionPlan
    subscriptionStatus : SubscriptionStatus
    razorpaySubscriptionId ?: string | null
    currentPeriodEnd ?: Date | null
    cancelAtPeriodEnd : boolean
    createdAt : Date
    updatedAt : Date
    comparePassword : ( password : string ) => Promise<boolean>
    omitPassword: () => Omit<UserDocument, 'password'>
}

const userSchema = new Schema<UserDocument>({

    name : {

        type : String,
        required : true,
        trim : true,
    }, 
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
    },
    profilePicture:{
        type:String,
        default:null,
    },
    password : {

        type : String,
        select : true,
        required : true,
    },
    subscriptionPlan : {
        type : String,
        enum : [ "FREE", "PRO" ],
        default : "FREE",
    },
    subscriptionStatus : {
        type : String,
        default : "none",
    },
    razorpaySubscriptionId : {
        type : String,
        default : null,
        index : true,
    },
    currentPeriodEnd : {
        type : Date,
        default : null,
    },
    cancelAtPeriodEnd : {
        type : Boolean,
        default : false,
    },
},
    {
        timestamps : true,
    }
)

userSchema.pre( "save", async function( next ){

    if( this.isModified("password") ){

        if( this.password ){

            this.password = await hashValue( this.password )
        }
    }
    next()
} )

userSchema.methods.omitPassword = function () : Omit<UserDocument, "password">
{

    const userObject = this.toObject()
    delete userObject.password
    return userObject
}

userSchema.methods.comparePassword = async function ( password : string ){

    return compareValue( password, this.password )
}

export const UserModel = mongoose.model<UserDocument>("User", userSchema)

/* 
    UserDocument - interface	Tells TypeScript what a User document looks like
    userSchema - Tells Mongoose how the data should be stored/validated
    userModel - Gives you methods to interact with MongoDB
*/