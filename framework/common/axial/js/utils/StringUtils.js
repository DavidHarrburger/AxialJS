"use strict";

class StringUtils
{
    static #COMA_REG = new RegExp(",", "g");

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

    static isWhiteString( s )
    {
        
    }
}

export { StringUtils }