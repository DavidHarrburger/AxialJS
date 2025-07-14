"use strict";

import { AxialServerUtils } from "../AxialServerUtils.js";

class AxialSchedulerTask
{
    /** @type { Set } */
    static #PERIODS = Object.freeze( new Set( ["hourly", "daily", "weekly", "monthly", "yearly" ] ) );

    /** @type { Function } */
    #operation;

    /** @type { String } */
    #period = "daily";

    /** @type { Number } */
    #hour = 9;

    /** @type { Number } */
    #day = 0;

    /** @type { Number } */
    #date = 1;

    /** @type { Number } */
    #month = 0;

    /** @type { Date } */
    #nextSchedule = undefined;

    /**
     * @type { Set }
     * @static
     * @readonly
     */
    static get PERIOD() { AxialSchedulerTask.#PERIODS; }

    constructor()
    {
        this.#updateNextSchedule();
    }

    /**
     * The next Date when the task must be ran
     * @type { Date }
     * @readonly
     */
    get nextSchedule() { return this.#nextSchedule; }

    /**
     * @type { Function }
     */
    get operation() { return this.#operation; }
    set operation( value )
    {
        if( typeof value !== "function" )
        {
            throw new TypeError("Function value required");
        }
        this.#operation = value;
    }

    /**
     * A pivate method to update the next date
     * override the _updateNexDate method to implement your own or add features
     * @private
     */
    #updateNextSchedule()
    {
        const instant = new Date();

        const y = instant.getFullYear();
        const m = instant.getMonth();
        const d = instant.getDate();
        const h = instant.getHours();
        const n = instant.getMinutes();

        /*
        const y = instant.getUTCFullYear();
        const m = instant.getUTCMonth();
        const d = instant.getUTCDate();
        const h = instant.getUTCHours();
        const n = instant.getUTCMinutes();
        */

        switch( this.#period )
        {
            case "hourly":
                const hourly = new Date( y, m, d, h+1, n, 0 );
                this.#nextSchedule = hourly;
            break;

            case "daily":
                const daily = new Date( y, m, d+1, this.#hour, 0, 0 );
                this.#nextSchedule = daily;
            break;

            default:
                //something wrong happened we just deactivate the nextSchedule
                this.#nextSchedule = undefined;
            break;
        }
        console.log( "#nextSchedule", this.#nextSchedule );
    }

    /**
     * 
     */
    async run()
    {
        console.log("runTask");
        let result = undefined;
        try
        {
            const isAsync = AxialServerUtils.isAsync( this.#operation );
            if( isAsync === true )
            {
                console.log("async");
                result = await this.#operation();
            }
            else
            {
                console.log("sync");
                result = this.#operation();
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#updateNextSchedule();
            return result;
        }
    }
    
}

export { AxialSchedulerTask }