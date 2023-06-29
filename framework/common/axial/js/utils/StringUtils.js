"use strict"

class StringUtils
{
    static toCapitalizeFirst( s )
    {
        if( typeof s !== "string" )
        {
            throw new TypeError("String value expected");
        }
        return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase(); ;
    }

    static isWhiteString( s )
    {
        
    }
}

export { StringUtils }