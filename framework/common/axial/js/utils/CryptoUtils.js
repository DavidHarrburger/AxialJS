"use strict";

class CryptoUtils
{
    static #LOWERS = "abcdefghijklmnopqrstuvwxyz";

    static #UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    static #NUMBERS = "0123456789";

    static #SPECIALS = "!@#$%&*()-_=+?";

    static #ALL = CryptoUtils.#LOWERS + CryptoUtils.#UPPERS + CryptoUtils.#NUMBERS + CryptoUtils.#SPECIALS;

    static #MIN = 8;

    static #MAX = 256;

    static getRandom( max )
    {
        if( Number.isInteger( max ) === false )
        {
            throw new TypeError(`Positive integer number value between ${CryptoUtils.#MIN} and ${CryptoUtils.#MAX} chars required`);
        }

        if( max < CryptoUtils.#MIN && max > CryptoUtils.#MAX )
        {
            throw new TypeError(`Positive integer number value between ${CryptoUtils.#MIN} and ${CryptoUtils.#MAX} chars required`);
        }

        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] % max;
    }

    static generatePassword( length = 16 )
    {
        if( Number.isInteger( length ) === false )
        {
            throw new TypeError(`Positive integer number value between ${CryptoUtils.#MIN} and ${CryptoUtils.#MAX} chars required`);
        }

        if( length < CryptoUtils.#MIN && length > CryptoUtils.#MAX )
        {
            throw new TypeError(`Positive integer number value between ${CryptoUtils.#MIN} and ${CryptoUtils.#MAX} chars required`);
        }

        // we have at least one of each char
        let password =
        [
            CryptoUtils.#LOWERS[ CryptoUtils.getRandom( CryptoUtils.#LOWERS.length ) ],
            CryptoUtils.#UPPERS[ CryptoUtils.getRandom( CryptoUtils.#UPPERS.length ) ],
            CryptoUtils.#NUMBERS[ CryptoUtils.getRandom( CryptoUtils.#NUMBERS.length ) ],
            CryptoUtils.#SPECIALS[ CryptoUtils.getRandom( CryptoUtils.#SPECIALS.length ) ],
        ];

        // we complete to the length
        for( let i = password.length; i < length; i++ )
        {
            password.push( CryptoUtils.#ALL[ CryptoUtils.getRandom(CryptoUtils.#ALL.length) ] );
        }

        // shuffle Fisher-Yates
        for( let i = password.length - 1; i > 0; i-- )
        {
            const j = CryptoUtils.getRandom(i + 1);
            [ password[i], password[j] ] = [ password[j], password[i]] ;
        }

        return password.join("");
        
    }

    static urlBase64ToUint8Array( base64 )
    {
        const padding = '='.repeat( (4 - base64.length % 4 ) % 4 );
        const base64Safe = ( base64 + padding ).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64Safe);
        return Uint8Array.from( [...raw].map( c => c.charCodeAt(0) ) );
    }
}

export { CryptoUtils }
