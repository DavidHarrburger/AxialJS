"use strict";

import { AxialViewBase } from "./AxialViewBase.js";

/// REWRITE BETTER AND ADD FUNCTIONS SUCHA AS DELETE AND SO ON
/// PRIORITY LOW

class AxialViewClassHelper
{
    static #AXIAL_VIEW_CLASSES = new Map();

    static addViewClass( key, value )
    { 
        // we probably create a TypeMap Class
        if( typeof key !== "string" )
        {
            throw new TypeError("String value expected");
        }

        if( typeof value !== "function" )
        {
            throw new TypeError("Function value expected");
        }

        // TODO : check what happened if key is already there
        // not a problem if the function is already registered
        AxialViewClassHelper.#AXIAL_VIEW_CLASSES.set(key, value);
    }

    static getViewClass( key )
    {
        // TODO : check here
        if( typeof key !== "string" )
        {
            throw new TypeError("String value expected");
        }
        return AxialViewClassHelper.#AXIAL_VIEW_CLASSES.get(key);
    }
}

export { AxialViewClassHelper }

