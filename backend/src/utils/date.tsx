import { endOfDay, endOfMonth, endOfYear, startOfMonth, startOfYear, subDays, subMonths, subYears } from "date-fns";
import { DateRangeEnum, type DateRangePreset } from "../enums/date_range.enum.js";

export const getDateRange = (

    preset?: DateRangePreset,
    customFrom?: Date,
    customTo?: Date
) => {

    if( customFrom && customTo ){

        return{
            from: customFrom,
            to : customTo,
            value : DateRangeEnum.CUSTOM,
        }
    }

    const now = new Date()
    
    const today = endOfDay(now)

    const last30Days = {
        from : subDays(today, 29),
        to : today,
        value : DateRangeEnum.LAST_30_DAYS,
        label: "Last 30 Days",
    }

    console.log(last30Days, "Last 30 Days")

    switch( preset ){
        
        case DateRangeEnum.ALL_TIME : 
            return { 
                from: null, 
                to:null, 
                value: DateRangeEnum.ALL_TIME, 
                label:" All Time" 
            }
            
        case DateRangeEnum.LAST_30_DAYS : return {
            from : startOfMonth(subMonths(now, 1)),
            to: endOfMonth(subMonths(now, 1)),
            value: DateRangeEnum.LAST_MONTH,
            label: "Last Month",
        }

        case DateRangeEnum.LAST_3_MONTHS : return {
            from : startOfMonth(subMonths(now, 3)),
            to: endOfMonth(subMonths(now, 1)),
            value: DateRangeEnum.LAST_3_MONTHS,
            label: "Last 3 Months",
        }

        case DateRangeEnum.LAST_YEAR : return {
            from : startOfYear(subYears(now, 1)),
            to: endOfYear(subYears(now, 1)),
            value: DateRangeEnum.LAST_YEAR,
            label: "Last Year",
        }

        default: return last30Days
    }
}