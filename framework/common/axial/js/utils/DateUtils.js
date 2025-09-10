"use strict";

class DateUtils
{

    /** @type { Number } */
    static #firstDayOfTheWeek = 1;

    /** @type { Array.<String> } */
    static #DAY_NAMES = [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ];

    /** @type { Array.<String> } */
    static #MONTH_NAMES = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];

    static getMonthName( n )
    {
        return DateUtils.#MONTH_NAMES[n];
    }

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
     * Check if the date d is between a Date Start ds and a Date End de, assuming Date Start < Date End
     * @static
     * @param { Date } d 
     * @param { Date } ds 
     * @param { Date } de 
     */
    static isInPeriodFrom( d, ds, de )
    {
        if( de < ds )
        {
            throw new RangeError("param dateEnd 'de' should be sup param dateStart 'ds'");
        }

        const present = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const past = new Date( ds.getFullYear(), ds.getMonth(), ds.getDate() ).getTime();
        const future = new Date( de.getFullYear(), de.getMonth(), de.getDate() ).getTime();

        let isInPeriod = false;
        if( present >= past && present <= future ) { isInPeriod = true; }
        return isInPeriod;
    }

    /**
     * 
     * @param { Date } d 
     * @returns { Boolean }
     */
    static isPast( d )
    {
        const past = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const now = new Date();
        const midnight = new Date( now.getFullYear(), now.getMonth(), now.getDate() ).getTime();
        return midnight > past;
    }

    /**
     * 
     * @param { Date } d 
     * @param { Date } lim 
     * @returns { Boolean }
     */
    static isPastFrom( d, lim )
    {
        const past = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const midnight = new Date( lim.getFullYear(), lim.getMonth(), lim.getDate() ).getTime();
        return midnight > past;
    }

    /**
     * 
     * @param { Date } d 
     * @returns { Boolean }
     */
    static isFuture( d )
    {
        const future = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const now = new Date();
        const midnight = new Date( now.getFullYear(), now.getMonth(), now.getDate() ).getTime();
        return midnight < future;
    }

    /**
     * 
     * @param { Date } d 
     * @param { Date } lim 
     * @returns { Boolean }
     */
    static isFutureFrom( d, lim )
    {
        const future = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const midnight = new Date( lim.getFullYear(), lim.getMonth(), lim.getDate() ).getTime();
        return midnight < future;
    }

    static goToPast( d, n )
    {
        const present = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const past = present - ( 1000 * 60 * 60 * 24 * n );
        return new Date( past );
    }

    static goToFuture( d, n )
    {
        const present = new Date( d.getFullYear(), d.getMonth(), d.getDate() ).getTime();
        const future = present + ( 1000 * 60 * 60 * 24 * n );
        return new Date( future );
    }

    static midnight( d )
    {
        return new Date( d.getFullYear(), d.getMonth(), d.getDate() );
    }

    static getNextMonth( d, n )
    {
        const m = new Date( d.getFullYear(), d.getMonth() + n, 1 );
        return m;
    }
    /**
     * Date validation checker
     * @param { Date } date 
     * @returns { Boolean }
     */
    static isValidDate( date )
    {
        return !isNaN(date);
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

    /**
     * 
     * @param { Date } d 
     * @returns { String }
     */
    static formatWithTime( d )
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

        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();

        const formated = `${year}-${formatedMonth}-${formatedDate} ${hours}:${minutes}:${seconds}`;
        return formated;
    }

    static formatString( d )
    {
        
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

    static nextDay( d = new Date() )
    {
        return new Date( d.getFullYear(), d.getMonth(), (d.getDate() + 1) ) ;
    }

    static previousDay( d = new Date() )
    {
        return new Date( d.getFullYear(), d.getMonth(), (d.getDate() - 1) ) ;
    }

    static formatHour( hour )
    {
        if( isNaN(hour) === true )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }
        if( hour < 0 || hour > 24 )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }

        const f = Math.floor(hour);
        return String(f).length === 1 ? "0"+f+":00" : f+":00";
    }

    /**
     * 
     * @param { Date } fd - the first date
     * @param { Date } sd - the second date 
     */
    static difference(fd, sd)
    {
        if( fd > sd )
        {
            throw new RangeError("param secondDate 'sd' should be sup param firstDate 'fd'");
        }
        const diff = sd.getTime() - fd.getTime();
        return diff;
    }
}

export { DateUtils }