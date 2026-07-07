"use strict";

class AxialWebSocket extends EventTarget
{
    /** 
     * @type { String }
     */
    #url;

    /** 
     * @type { WebSocket }
     */
    #ws;

    /// events
    /** @type { Function } */
    #boundSocketOpenHandler;

    /** @type { Function } */
    #boundSocketMessageHandler;

    /** @type { Function } */
    #boundSocketErrorHandler;

    /** @type { Function } */
    #boundSocketCloseHandler;

    constructor( url = "" )
    {
        super();

        if( typeof url !== "string" )
        {
            throw new TypeError("String value required");
        }

        // TODO more check here
        this.#url = url;

        this.#boundSocketOpenHandler = this.#socketOpenHandler.bind(this);
        this.#boundSocketMessageHandler = this.#socketMessageHandler.bind(this);
        this.#boundSocketErrorHandler = this.#socketErrorHandler.bind(this);
        this.#boundSocketCloseHandler = this.#socketCloseHandler.bind(this);

        this.#createSocket();
    }

    /**
     * @readonly
     * @type { String }
     */
    get url() { return this.#url; }

    /**
     * @readonly
     * @type { WebSocket }
     */
    get ws() { return this.#ws; }

    #createSocket()
    {
        this.#ws = new WebSocket( this.#url );

        this.#ws.addEventListener("open", this.#boundSocketOpenHandler);
        this.#ws.addEventListener("message", this.#boundSocketMessageHandler);
        this.#ws.addEventListener("error", this.#boundSocketErrorHandler);
        this.#ws.addEventListener("close", this.#boundSocketCloseHandler);

    }

    send( message )
    {
        if( typeof message !== "string" )
        {
            throw new TypeError("message must be a String");
        }

        message = message.trim();
        if( message === "" ) { return; }
        if( this.#ws )
        {
            //console.log( "readyState", this.#ws.readyState );
            this.#ws.send(message);
        }

    }

    #socketOpenHandler( event )
    {
        console.log("We are rockin'");
        const appSocketEvent = new CustomEvent("socketOpen");
        this.dispatchEvent(appSocketEvent);
    }

    #socketMessageHandler( event )
    {
        //console.log("Message : ", event.data);
        const appSocketEvent = new CustomEvent("socketMessage", { detail: { message: event.data } } );
        this.dispatchEvent(appSocketEvent);
    }

    #socketErrorHandler( event )
    {
        console.log("socket error");
        const appSocketEvent = new CustomEvent("socketError");
        this.dispatchEvent(appSocketEvent);
    }

    #socketCloseHandler( event )
    {
        //console.log("socket close");
        const appSocketEvent = new CustomEvent("socketClose");
        this.dispatchEvent(appSocketEvent);
    }
}

export { AxialWebSocket }