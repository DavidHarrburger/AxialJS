"use strict"

class ArrayUtils
{
    /**
     * 
     * @param { Array } a 
     * @returns { Array }
     */
    static shuffle(a)
    {
        let b = new Array();
        while( a.length > 0 )
        {
            let l = a.length;
            let i = Math.round( Math.random() * l );
            i = i == l ? i-1 : i;
            let e = a.splice(i,1);
            b.push(e[0]);
        }
        return b;
    }

    static ofStringEquals( a, b )
    {
        if( Array.isArray(a) === false || Array.isArray(b) === false ) { return false; }
        if( a.every( v => typeof v === "string" ) === false || b.every( v => typeof v === "string" ) === false ) { return false; }
        if( a.length !== b.length ) { return false; }
        const setA = new Set(a); const setB = new Set(b);
        if( setA.size !== setB.size ) { return false };
        for( const value of setA )
        {
            if( setB.has(value) === false ) { return false };
        }
        return true;
    }
}

export { ArrayUtils }