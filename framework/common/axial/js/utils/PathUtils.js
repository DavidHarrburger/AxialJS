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
}

export { PathUtils }