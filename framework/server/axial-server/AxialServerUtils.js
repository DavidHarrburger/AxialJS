"use strict";

import { MAIN_DOMAIN } from "./AxialServerConstants.js";

class AxialServerUtils
{
    /**
     * 
     * @param { Number } n - a positive integer > 0, defines the length of the verification code
     * @returns { String } - the verification code
     */
    static getVerificationCode( n = 6 )
    {
        if( isNaN(n) === true || n === 0 )
        {
            throw new TypeError("Positive Number value required");
        }

        const num = Math.abs(Math.ceil(n));
        let verificationCode = "";
        for( let i = 0; i < num; i++ )
        {
            verificationCode += String( Math.round( Math.random() * 9 ) );
        }
        return verificationCode;
    }

    /**
     * 
     * @param { Function } f 
     */
    static isAsync( f )
    {
        if( typeof f !== "function" )
        {
            throw new TypeError("[Axial_SERVER] parameter must a function" );
        }
        return f.toString().trim().startsWith("async");
    }

    static compareMap( a, b )
    {
        let r = 0;
        if( a[1] > b[1] )
        {
            r = -1;
        }
        else if( a[1] < b[1] )
        {
            r = 1;
        }
        else
        {
            r = 0;
        }
        return r;
    }

    /**
     * 
     * @param { String } relative 
     */
    static getPathFromRelative( relative )
    {
        const path = MAIN_DOMAIN + relative.substring(1);
        return path;
    }

    
}

export { AxialServerUtils }