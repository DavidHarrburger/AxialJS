"use strict"

class DomUtils
{
    /**
     * Empty the whole element
     * @param { HTMLElement } element 
     */
    static cleanElement( element )
    {
        if( element instanceof Element == false )
        {
            throw new TypeError("Element value expected");
        }
        while( element.lastChild )
        {
            element.removeChild( element.lastChild );
        }
    }
}

export { DomUtils }