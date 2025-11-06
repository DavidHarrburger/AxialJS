"use strict";

class FormatUtils
{
    static formatPhone( s )
    {
        const a = s.split("");
        const l = a.length;
        let r = "";
        for( let i = 0; i < l; i++ )
        {
            const c = a[i];
            const space = i !== 0 && i%2 !== 0;
            r = space === true ? r + c + " " : r + c;
        }
        return r;
    }

    // buggy as far as I remember
    static formatNumber( s, n )
    {
        const a = String(s).split("").reverse().join();
        console.log(a);
        const l = a.length;
        let r = "";
        for( let i = 0; i < l; i++ )
        {
            const c = a[i];
            const space = i !== 0 && i%n !== 0;
            r = space === true ? r + c + " " : r + c;
        }
        return r.split("").reverse().join();
    }
}

export { FormatUtils }