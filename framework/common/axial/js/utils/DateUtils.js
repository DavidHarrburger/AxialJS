"use strict"

class DateUtils
{

    /**
     * Check if the current day i.e. new Date is between a Date Start and a Date End, assuming Date Start < Date End
     * @static
     * @param { Date } ds 
     * @param { Date } de 
     */
    static isInPeriod( ds, de )
    {
        if( de < ds )
        {
            throw new RangeError("param dateEnd 'de' should be sup param dateStart 'ds'");
        }
        const d = Date.now();

        let isInPeriod = false;
        if( d >= ds && d <= de ) { isInPeriod = true; }
        return isInPeriod;
    }

    /**
     * Format a Date d to dd/mm/yyyy. To rewrite w/ usingLocal builtIn
     * @param { Date } d 
     */
    static format( d )
    {
        if( d instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        const year = String( d.getFullYear() );

        const month = String(d.getMonth() + 1);
        const formatedMonth = month.length === 1 ? "0" + month : month;

        const date = String( d.getDate() );
        const formatedDate = date.length === 1 ? "0" + date : date;

        const formated = formatedDate + "/" + formatedMonth + "/" + year;
        return formated;
    }

    static tomorrow()
    {
        // return new Date( new Date().getDate() + 1 );
        const today = new Date();
        const tomorrow = new Date( today.getFullYear(), today.getMonth(), (today.getDate() + 1) );
        return tomorrow;
    }

    static yesterday()
    {
        const today = new Date();
        const yesterday = new Date( today.getFullYear(), today.getMonth(), (today.getDate() - 1) );
        return yesterday;
    }

    static duration( n )
    {
        let milli = 0;
        let sec = 0;
        let min = 0;
        let hour = 0;
        let nday = 0;

        sec = Math.floor( n / 1000);
        milli = n % 1000;

        min = Math.floor( sec / 60);
        sec = sec % 60;

        hour = Math.floor( min / 60);
        min = min % 60;

        //let r = String(min) + "min " + String(sec) +"s " + String(milli) + "ms";
        let r = String(milli) + "ms";

        if( sec > 0 )
        {
            r = String(sec) +"s " + r;
        }

        if( min > 0 )
        {
            r = String(min) + "min " + r;
        }

        if( hour > 0 )
        {
            r = String(hour) + "h " + r;
        }

        return r;
    }
}

export { DateUtils }