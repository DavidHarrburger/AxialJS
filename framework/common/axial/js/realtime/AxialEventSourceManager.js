"use strict";

import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialEventSourceManager extends EventTarget
{
    /** @type { EventSource } */
    #eventSource;

    /** @type { String } */
    #sourcePath = PathUtils.getPathFromRelative("./api/realtime/source");

    /** @type { String } */
    #eventPath = PathUtils.getPathFromRelative("./api/realtime/event");

    /** @type { Map } */
    #events = new Map();

    /// events
    /** @type { Function } */
    #boundOpenHandler;

    /** @type { Function } */
    #boundMessageHandler;

    /** @type { Function } */
    #boundEventHandler;

    /** @type { Function } */
    #boundErrorHandler;

    constructor()
    {
        super();

        this.#boundOpenHandler = this.#openHandler.bind(this);
        this.#boundMessageHandler = this.#messageHandler.bind(this);
        this.#boundEventHandler = this.#eventHandler.bind(this);
        this.#boundErrorHandler = this.#errorHandler.bind(this);

        this.#eventSource = new EventSource( this.#sourcePath );
        this.#eventSource.addEventListener( "open", this.#boundOpenHandler );
        this.#eventSource.addEventListener( "message", this.#boundMessageHandler );
        this.#eventSource.addEventListener( "error", this.#boundErrorHandler );
    }

    /**
     * 
     * @param { String } eventName 
     * @param { Function } callback 
     */
    addEvent( eventName, callback )
    {
        if( StringUtils.isWhite(eventName) === true ) 
        {
            return;
        }
        if( this.#events.has( eventName ) )
        {
            return;
        }
        if( this.#eventSource )
        {
            this.#events.set( eventName, callback );
            this.#eventSource.addEventListener( eventName, this.#boundEventHandler )
        }
    }

    /**
     * 
     * @param { String } eventName 
     */
    removeEvent( eventName )
    {
        if( StringUtils.isWhite(eventName) === true ) 
        {
            return;
        }
        if( this.#events.has( eventName ) )
        {
            return;
        }
        if( this.#eventSource )
        {
            this.#events.delete( eventName );
            this.#eventSource.removeEventListener( eventName, this.#boundEventHandler )
        }
    }

    /**
     * 
     * @param { String } name 
     * @param { Object } data 
     */
    async sendEvent( name, data )
    {
        const payload = { name: name, data: data };
        const response = await FetchUtils.POST( this.#eventPath, payload );
    }

    /**
     * 
     * @param { Event } event 
     */
    #openHandler( event )
    {
        console.log("open", event);
    }

    /**
     * 
     * @param { MessageEvent } event 
     */
    #messageHandler( event )
    {
        console.log("message", event);
    }

    /**
     * 
     * @param { Event } event 
     */
    #eventHandler( event )
    {
        console.log("event of any kind", event);
        const callback = this.#events.get( event.type );
        callback( event.data );
    }

    /**
     * 
     * @param { Event } event 
     */
    #errorHandler( event )
    {
        console.log("error", event);
    }
}

export { AxialEventSourceManager }