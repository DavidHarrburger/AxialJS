"use strict";

class UnitUtils
{
    static #UNITS = Object.freeze( new Map(
        [
            [ "m",    { type: "length", base: 1 ,     default: "mètre",      labels: [ "mètre", "mètres", "m", "m." ] } ],
            [ "ml",   { type: "length", base: 1 ,     default: "mètre linéaire",      labels: [ "mètre linéaire", "mètres linéaires", "ml", "ml." ] } ],
            [ "cm",   { type: "length", base: 0.01 ,  default: "centimètre", labels: [ "centimètre", "centimètre", "cm", "cm." ] } ],
            [ "mm",   { type: "length", base: 0.001 , default: "millimètre", labels: [ "millimètre", "millimètres", "mm", "mm." ] } ],

            [ "m²",   { type: "surface", base: 1 , default: "mètre carré", labels: [ "mètre carré", "mètres carrés", "m²" ] } ],

            [ "sec",  { type: "time",   base: 1 ,     default: "seconde",    labels: [ "seconde", "secondes", "sec", "s", "s." ] } ],
            [ "min",  { type: "time",   base: 60 ,    default: "minute",     labels: [ "minute", "minutes", "min", "m", "m." ] } ],
            [ "hour", { type: "time",   base: 3600 ,  default: "heure",      labels: [ "heure", "heures", "h", "h." ] } ],
            [ "day",  { type: "time",   base: 25200 , default: "jour",       labels: [ "jour", "jours", "j", "j." ] } ],

            [ "u",    { type: "unit",   base: 1,      default: "pièce",      labels: [ "pièce", "pièces", "pce", "u", "unité", "unit", "unit." ] } ]
        ]
    ));

    static get UNITS() { return UnitUtils.#UNITS; }

    static convert( value = 0, type = "", from = "", to = "" )
    {
        if( arguments.length !== 4 )
        {
            throw new Error("UnitsUtils.convert expects 4 arguments");
        }

        if( isNaN(value) === true ) { throw new TypeError( "Number value required" ); }

        if( from === "" ) { return; }
        if( to === "" )   { return; }

        const baseFrom = UnitUtils.getUnitObject( type, from )[1].base;
        const baseTo = UnitUtils.getUnitObject( type, to )[1].base;

        const converted = value * baseFrom / baseTo;
        return converted;
    }

    static getTypes()
    {
        const a = Array.from( UnitUtils.#UNITS );
        const s = new Set();
        for( const u of a )
        {
            const t = u[1].type;
            if( s.has(t) === false ) { s.add(t); }
        }
        return Array.from(s);
    }

    static getUnitsByType( type = "" )
    {
        if( typeof type !== "string" )
        {
            throw new TypeError("String value required");
        }
        
        const a = Array.from( UnitUtils.#UNITS );
        const m = new Map();
        for( const u of a )
        {
            const k = u[0];
            const v = u[1];
            const t = v.type;
            
            if( type === t )
            {
                m.set( k, v );
            }
        }
        return m;
    }

    static getUnitObject( type = "", label = "" )
    {
        const m = UnitUtils.getUnitsByType(type);
        const a = Array.from( m );
        for( const u of a )
        {
            const i = u[1].labels.indexOf(label);
            if( i >= 0 )
            {
                return u;
            }
        }
        return undefined;
    }

    /// TEMP to go fast
    static formatMinutesToString( time = 0 )
    {
        //console.log(time);
        if( isNaN(time) === true )
        {
            // SUPER WARNING TO EXPLORE
            //throw new TypeError("Number value required");
        }

        if( time < 0 ) { throw new TypeError("Positive Number value required"); }

        if( time === 0 )
        {
            return "0 heure";
        }

        const numOfDays = Math.floor( time / ( 7 * 60 ) );
        const restOfDaysInMinutes = time % ( 7 * 60 );

        const numOfHours = Math.floor( restOfDaysInMinutes / 60 );
        const restOfHoursInMintues = restOfDaysInMinutes % 60;

        let minutesFormated = "";
        if( numOfDays > 0 )
        {
            minutesFormated = minutesFormated + numOfDays + " jour";
            if( numOfDays > 1 )
            {
                minutesFormated = minutesFormated + "s";
            }
        }

        if( numOfHours > 0 )
        {
            minutesFormated = minutesFormated + " " + numOfHours + " heure";
            if( numOfHours > 1 )
            {
                minutesFormated = minutesFormated + "s";
            }
        }

        if( restOfHoursInMintues > 0 )
        {
            minutesFormated = minutesFormated + " " + restOfHoursInMintues.toFixed(2) + " min.";
        }

        return minutesFormated.trim();

    }
}

export { UnitUtils }