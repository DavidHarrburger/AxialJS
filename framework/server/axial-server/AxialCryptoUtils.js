"use strict"

import
{
    CRYPTO_ALGORITHM,
    CRYPTO_KEY,
    CRYPTO_IV
} from "./AxialServerConstants.js";
import crypto from "node:crypto";

const CRYPTO_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

class AxialCryptoUtils
{
    /**
     * Encrypt the s String Param
     * @param { String } s 
     * @returns { String }
     */
    static encrypt( s )
    {
        const cipher = crypto.createCipheriv( CRYPTO_ALGORITHM, Buffer.from(CRYPTO_KEY), Buffer.from(CRYPTO_IV) );
        let encrypted = cipher.update(s, "utf-8", "hex");
        encrypted += cipher.final("hex");
        return encrypted;
    }

    /**
     * Decrypt the s String Param
     * @param { String } s 
     * @returns { String }
     */
    static decrypt( s )
    {
        const decipher = crypto.createDecipheriv( CRYPTO_ALGORITHM, Buffer.from(CRYPTO_KEY), Buffer.from(CRYPTO_IV) );
        let decrypted = decipher.update(s, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    }

    /**
     * Generate a key
     * @param { Number } n The length of the key
     * @returns { String } The pseudo random key
     */
    static generateKey( n = 32 )
    {
        const d = 32;

        if( isNaN(n) === true ) { n = d; }
        if( n <= 0 )            { n = d; }
        if( n > 256 )           { n = d; }
        
        let a = CRYPTO_CHARS.split("");
        let b = new Array();
        while( a.length > 0 )
        {
            let l = a.length;
            let i = Math.round( Math.random() * l );
            i = i == l ? i-1 : i;
            let e = a.splice(i,1);
            b.push(e[0]);
        }
        
        const c = b.length;
        let r = "";
        for( let k = 0; k < n; k++ )
        {
            const w = b[Math.round( Math.random() * (c-1) )];
            r = r + w;
        }
        return r;
    }
}

export { AxialCryptoUtils }