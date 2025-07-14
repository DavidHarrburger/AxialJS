"use strict";

class PathUtils
{

    /**
     * @static
     * @returns { String }
     */
    static getPathFromRelative( relative )
    {
        return new URL( relative, window.location.origin ).href;
    }
}

export { PathUtils }