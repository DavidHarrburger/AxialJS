"use strict";

//import EventEmitter from "node:events";

class AxialMailTemplateBase
{
    /** @type { String } */
    name = "";

    constructor()
    {
        //super();
    }

    /**
     * @abstract
     * @param { Object } object
     * @returns { String }
     */
    _getHTML( object )
    {
        return "";
    }
}

export { AxialMailTemplateBase }