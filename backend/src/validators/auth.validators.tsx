import { z } from "zod"

export const emailSchema = z
.string()
.trim()
.email("Invalid Email Address")
.min(1)
.max(255)

export const passwordSchema = z.string().trim().min(4)

export const registerSchema = z.object({

    name : z.string().trim().min(1).max(255),
    email : emailSchema,
    password : passwordSchema
})

export const loginSchema = z.object({

    email : emailSchema,
    password : passwordSchema
})

export type RegisterSchemaType = z.infer<typeof registerSchema>

export type LoginSchemaType = z.infer<typeof loginSchema>

// Zod is a TypeScript-first schema validation library. It is used to check whether data has the correct type and format before your application processes it.