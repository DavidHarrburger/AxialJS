"use strict";

import { AxialMongo } from "../AxialMongo.js";
import { AxialMailer } from "../AxialMailer.js";
import { AxialServerDateUtils } from "../utils/AxialServerDateUtils.js";

import { EMAIL_USER } from "../AxialServerConstants.js";
import { AxialServerUtils } from "../AxialServerUtils.js";

class AxialSchedulerOperations
{
    /** @type { AxialMongo } */
    static #MONGO;

    /** @type { AxialMailer } */
    static #MAILER;

    /**
     * @static
     * @param { AxialMongo } value
     */
    static set mongo( value )
    {
        AxialSchedulerOperations.#MONGO = value;
    }

    /**
     * @static
     * @param { AxialMailer } value
     */
    static set mailer( value )
    {
        AxialSchedulerOperations.#MAILER = value;
    }

    static async sendAnalyticsReport()
    {
        try
        {
            const mailer = AxialSchedulerOperations.#MAILER;
            const mongo = AxialSchedulerOperations.#MONGO;
            const filters = { type: "page" }
            const stats = await mongo.getData("stats", filters);

            // prepare the data for the mail
            let reportObject = {};

            if( stats === null )
            {
                reportObject.data = undefined;
            }
            else
            {
                if( Array.isArray(stats) === false )
                {
                    reportObject.data = [stats];
                }
                else
                {
                    reportObject.data = stats;
                }

                let rankMap = new Map();
                let dayMap = new Map();
                const today = new Date();
                for( const stat of stats )
                {
                    // rank
                    const url = stat.url;
                    if( rankMap.has(url) === false )
                    {
                        rankMap.set( url, 1 );
                    }
                    else
                    {
                        const n = rankMap.get(url) + 1;
                        rankMap.set(url, n);
                    }

                    // days
                    const date = new Date(stat.dateStart);
                    const mapDate = new Date( date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                    if( dayMap.has(mapDate) === false )
                    {
                        dayMap.set(mapDate, 1);
                    }
                    else
                    {
                        const n = dayMap.get(mapDate) + 1;
                        dayMap.set(mapDate, n);
                    }
                }

                // rank final
                const rankArray = Array.from( rankMap );
                rankArray.sort( AxialServerUtils.compareMap );
                reportObject.rankArray = rankArray;

                // day final
                const yesterday = AxialServerDateUtils.previousDay(today);
                const compareYesterday = AxialServerDateUtils.previousDay(yesterday);

                const yTime = yesterday.getTime();
                const cTime = compareYesterday.getTime();

                const yNum = dayMap.get(yTime) === undefined ? 0 : dayMap.get(yTime);
                const cNum = dayMap.get(cTime) === undefined ? 0 : dayMap.get(cTime);

                const yName = AxialServerDateUtils.formatString( new Date(yesterday) );
                const cName = AxialServerDateUtils.formatString( new Date(compareYesterday) );

                reportObject.cName = cName;
                reportObject.cNum = cNum;

                reportObject.yName = yName;
                reportObject.yNum = yNum;

                let progress = "-";

                if( cNum !== 0) { progress = Math.round( ((yNum - cNum) / cNum) * 100 ); }
                reportObject.progress = progress;
            }
            const result = await mailer.sendMail("Auto report", "david@dndev.fr;dndev.fr@gmail.com", "analytics_report", reportObject);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            console.log("analytics operation finished with or without success");
        }
    }
}

export { AxialSchedulerOperations }