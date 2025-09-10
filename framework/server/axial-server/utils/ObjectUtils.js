"use strict";

class ObjectUtils
{
    /**
     * 
     * @param { Object } o the object we want to parse
     * @param { String } n the name of the property
     * @param { String } f the name of the field
     * @param { Boolean } r recursive
     * @returns 
     */
    static findValueInObject( o, n, f, r = true )
    {
        // do not forget to check args ;)

        //console.log( "START", o );

        let result = undefined;

        // we check first the first level properties
        for( const p of Object.keys( o ) )
        {
            
            const a = o[p];
            //console.log( p );
            //console.log( a );

            if( typeof a !== "object" && p === n )
            {
                result = a;
                break;
            }
            else if( a === n && Object.hasOwn( o, f ) === true )
            {
                //console.log("OBJECT FOUND AND PROPERTY ELSEWHERE FOUND");
                result = o[f];
                break;
            }
            else if( typeof a === "object" )
            {
                //console.log("case array or object : recursive here ");
                result = ObjectUtils.findValueInObject(a, n, f);
                //console.log("END", result);
                if( result !== undefined )
                {
                    break;
                }
            }
            /*
            else
            {
                console.log("on a fini avec cette propriété");
            }
            */
        }
        return result;
    }
}

export { ObjectUtils }