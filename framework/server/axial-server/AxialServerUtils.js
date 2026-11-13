"use strict";

import { MAIN_DOMAIN, OTP_SECRET_KEY } from "./AxialServerConstants.js";
import crypto from "node:crypto";

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

    static getCryptedVerificationCode( l = 6 )
    {
        if( isNaN(l) === true ) { throw new TypeError("Number value required"); }
        const code = crypto.randomInt(1000000).toString().padStart(6, "0");
        const hash = AxialServerUtils.sha256( code )
        return { code: code, hash: hash };
    }

    /**
     * 
     * @param { String } s 
     * @returns { String }
     */
    static sha256( s )
    {
        return crypto.createHmac("sha256", OTP_SECRET_KEY).update(s).digest("hex");
    }

    static generateKey( length = 8 )
    {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.randomBytes(length);
        return Array.from(bytes, b => chars[b % chars.length]).join('');
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