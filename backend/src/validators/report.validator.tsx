import { z } from 'zod'

const reportSettingSchema = z.object({
    isEnabled: z.boolean().default(true),
})

export const updateReportSettingSchema = reportSettingSchema.partial()

export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>