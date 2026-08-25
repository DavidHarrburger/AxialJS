"use strict";

class PathUtils
{

    /**
     * @static
     * @param { String } relative 
     * @returns { String }
     */
    static getPathFromRelative( relative )
    {
        if( PathUtils.isRelative( relative ) === true  )
        {
            return new URL( relative, window.location.origin ).href;
        }
        return relative;
    }

    static isRelative( path )
    {
        if( typeof path !== "string" )
        {
            throw new TypeError("String value required");
        }

        return path.trim().indexOf("./") === 0;
    }
}

export { PathUtils }