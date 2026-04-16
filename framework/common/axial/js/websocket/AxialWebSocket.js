"use strict";

class AxialWebSocket extends EventTarget
{
    /** @type { String } */
    #url;

    /** @type { WebSocket } */
    #ws;

    constructor( url )
    {
        super();
    }
}