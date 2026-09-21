import { addDays, addMonths, addWeeks, addYears, startOfMonth } from 'date-fns'
import { RecurringIntervalEnum } from '../models/transaction.model.js'

export function calculateNextReportDate( lastSentDate ?: Date ) : Date {

    const now = new Date()

    const lastSent = lastSentDate || now // If we pass the lastSentDate we should calculate it now.

    const nextDate = startOfMonth( addMonths(lastSent, 1) ) // lastSentDate is going to add 1 Month.
    nextDate.setHours(0, 0, 0, 0)

    console.log( nextDate, "Next Date" )

    return nextDate
}

export function calculateNextOccurrence( date : Date, interval : keyof typeof RecurringIntervalEnum ){

    const base = new Date(date)
    base.setHours(0, 0, 0, 0)

    switch( interval ){

        case RecurringIntervalEnum.DAILY : return addDays(base, 1)
        case RecurringIntervalEnum.WEEKLY : return addWeeks( base, 1 )
        case RecurringIntervalEnum.MONTHLY : return addMonths( base, 1 )
        case RecurringIntervalEnum.YEARLY : return addYears( base, 1 )
        default : return base
    }
}

export function capitalizeFirstLetter(string:string) {

    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}