"use strict"

class ArrayUtils
{
    /**
     * 
     * @param {Array} a 
     * @returns {Array}
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
}

export { ArrayUtils }