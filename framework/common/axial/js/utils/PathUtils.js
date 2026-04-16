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
        return new URL( relative, window.location.origin ).href;
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