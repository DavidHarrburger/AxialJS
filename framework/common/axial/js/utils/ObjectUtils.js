"use strict";

class ObjectUtils
{
    /**
     * 
     * @param { Object } o the object we want to parse
     * @param {*} n 
     * @param {*} f 
     * @param { Boolean} r recursive
     * @returns 
     */
    static getObjectByField( o, n, f, r = true )
    {
        // do not forget to check args ;)
        for( const p of Object.keys( o ) )
        {
            const a = o[p];
            if( p === n && a === f ) { return o; }
            if( r === true && Array.isArray(a) === true )
            {
                for( const b of a )
                {
                    const i = ObjectUtils.getObjectByField( b, n, f );
                    if( i !== undefined ) { return i; }
                }
            }
        }
        return undefined;
    }

    static getObjectByProperty( object = {}, property = "" )
    {
        for( const p of Object.keys( object ) )
        {
            if( p === property )
            {
                return object[p];
            }
        }
        // !!!! DO NOT FORGET TO ADD 'field' as a parameter
        // this is a quick fix for the service form
        return ObjectUtils.getObjectByField( object, "field", property );


        //return undefined;
    }

    static getObjectDifference( no, oo )
    {
        let diff = {};
        // check and throws

        // check keys first
        for( const key of Object.keys(no) )
        {
            console.log( Object.hasOwn(oo, key) );
        }

        return diff;

    }
}

export { ObjectUtils }