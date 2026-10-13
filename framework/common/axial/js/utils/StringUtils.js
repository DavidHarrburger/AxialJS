"use strict";

class StringUtils
{
    static #COMA_REG = new RegExp(",", "g");
    static #DOT_REG = /\./g;

    /** @readonly */
    static get COMA_REG() { return StringUtils.#COMA_REG; }
    
    static toCapitalizeFirst( s )
    {
        if( typeof s !== "string" )
        {
            throw new TypeError("String value expected");
        }
        return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase(); ;
    }

    /**
     * 
     * @param { String } s 
     * @returns { Number } the number of coma.s
     */
    static countComas( s = "" )
    {
        if( s === undefined || s === null || s === "" )
        {
            throw new TypeError("No empty string");
        }
        
        return ( s.match( StringUtils.COMA_REG ) || [] ).length;
    }

    static countDots( s = "" )
    {
        if( s === undefined || s === null )
        {
            throw new TypeError("No empty string");
        }
        
        return ( s.match( StringUtils.#DOT_REG ) || [] ).length;
    }

    /**
     * @param { String } c The char we want to check. Only one accepted. See countExpression
     * @param { String } s The string we investigate
     * @returns { Number } the number of coma.s
     */
    static countChar( c = "", s = "" )
    {
        if( c === undefined || c === null || c === "" || c.length !== 1 )
        {
            throw new TypeError("Only one char accepted here");
        }

        if( s === undefined || s === null || s === "" )
        {
            throw new TypeError("No empty string");
        }
        
        return ( s.match( new RegExp( c, "g" ) ) || [] ).length;
    }

    static isWhite( s )
    {
        if( typeof s !== "string" )
        {
            throw new TypeError("String value required");
        }
        s = s.trim();
        if( s.length === 0 )
        {
            return true;
        }

        if( /\S/.test( s ) === false )
        {
            return true;
        }

        return false;
    }

    static formatPrice( price, digit = 2 )
    {
        if( isNaN( price ) === true )
        {
            throw new TypeError( "Number value required" );
        }

        if( isNaN( digit ) === true )
        {
            throw new TypeError( "Number value required" );
        }

        if( Number.isInteger( digit ) === false )
        {
            throw new TypeError( "Positive integer value required for digit" );
        }

        if( digit < 0 === true )
        {
            throw new TypeError( "Positive integer value required for digit" );
        }

        /// KEEP FOR LOGICAL*
        /// Always a good thing to search by yourself
        /// please note you can use regex --> you will learn something
        /// Use AI --> you learn nothing and at the end you will not probably earn more
        /// This is a definition of RL (Real Logic)

        /*
        let fixed = Number( price ).toFixed( digit );
        let split = fixed.split(".");
        let whole = split[0];
        let modulo = whole.length % 3;
        const a = whole.split("");
        const l = a.length;
        if( l > 3 ) { modulo = 3; }


        let final = "";
        let moduloCounter = 0;
        for( let i = 0; i < l; i ++ )
        {
            final = final + a[i];
            moduloCounter ++;
            if( l > 3 && moduloCounter === modulo && i != (l-1) )
            {
                final = final + " ";
                moduloCounter = 0; modulo = 3;
            }
        }
        
        final = final + "." + ( split[1] === undefined ? "" : ("." + split[1]) ) + " €";
        console.log( final );
        */
        return Number( Number( price ).toFixed(digit) ).toLocaleString( "fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) + " €";
    }
}

export { StringUtils }