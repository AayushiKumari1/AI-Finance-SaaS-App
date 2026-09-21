import { formatCurrency } from "../utils/format_currency.js";
import { sendEmail } from "./mailer.js";
import { getReportEmailTemplate } from "./templates/report.template.js";

type ReportEmailParams = {
    email : string,
    username: string,
    report: {
        period:string,
        totalIncome:number,
        totalExpenses: number,
        availableBalance: number,
        savingsRate: number,
        topSpendingCategories: Array<{ name: string; percent: number }>,
        insights: string[],
    }

    frequency: string
}

export const sendReportEmail = async( params: ReportEmailParams )=>{

    const { email, username, report, frequency } = params
    
    const html = getReportEmailTemplate(
    {
        username,
        ...report,
    },
    frequency
    )

    const text = `Your ${frequency} Financial Report (${report.period})
        Income: ${formatCurrency(report.totalIncome)}
        Expenses: ${formatCurrency(report.totalExpenses)}
        Balance: ${formatCurrency(report.availableBalance)}
        Savings Rate: ${report.savingsRate.toFixed(2)}%

        ${report.insights.join("\n")}
    `
    
    console.log
    
    return sendEmail({
        to: email,
        subject:`${frequency} Financial Report - ${report.period}`,
        text,
        html,
    })
}