"use strict";

class AxialServerDateUtils
{

    /** @type { Number } */
    static #firstDayOfTheWeek = 1;

    /** @type { Array.<String> } */
    static #DAY_NAMES = [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ];

    /** @type { Array.<String> } */
    static #MONTH_NAMES = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];


    static nextDay( d = new Date() )
    {
        return new Date( d.getFullYear(), d.getMonth(), (d.getDate() + 1) ) ;
    }

    static previousDay( d = new Date() )
    {
        return new Date( d.getFullYear(), d.getMonth(), (d.getDate() - 1) ) ;
    }

    static formatString( d = new Date() )
    {
        return `${AxialServerDateUtils.#DAY_NAMES[d.getDay()]} ${d.getDate()} ${AxialServerDateUtils.#MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }

}

export { AxialServerDateUtils }