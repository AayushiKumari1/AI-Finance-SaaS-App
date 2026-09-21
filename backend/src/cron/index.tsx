import { startJobs } from "./scheduler.js"

export const intializeCrons = async() =>{

    try{

        const jobs = startJobs()
        console.log(`⏰ ${jobs.length} cron jobs intialized`)
        return jobs
    }
    catch(error){
        console.error("CRON INIT ERROR", error)
        return[]
    }
}