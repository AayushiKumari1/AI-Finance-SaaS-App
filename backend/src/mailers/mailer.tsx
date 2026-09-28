import { Env } from "../config/env.config.js"
import { resend } from "../config/resend.connfig.js"

type Params = {
    to: string | string[]
    subject: string
    text: string
    html: string
    from?: string
}

const mailer_sender = `Finora <${Env.RESEND_MAILER_SENDER}>`

export const sendEmail = async ({
    to,
    from = mailer_sender,
    subject,
    text,
    html,
}: Params) => {

    console.log("REPORT EMAIL RECIPIENT:", to)
    console.log("REPORT EMAIL SENDER:", from)

    const result = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        text,
        subject,
        html,
    })

    console.log("REPORT EMAIL RESULT:", result)

    if (result.error) {
        console.error("RESEND EMAIL ERROR:", result.error)

        throw new Error(result.error.message)
    }

    return result.data
}
