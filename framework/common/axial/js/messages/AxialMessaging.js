"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialMessage } from "./AxialMessage.js";
import { AxialTypingBubble } from "./AxialTypingBubble.js";
import { AxialWebSocket } from "../websocket/AxialWebSocket.js";

class AxialMessaging extends AxialComponentBase
{
    /// vars
    /** @type { AxialWebSocket } */
    #websocket;

    /** @type { String } */
    #socketUrl;

    /** @type { Number } */
    #typingDelay = 2000;

    /** @type { Number } */
    #typingTimeoutId;

    /** @type { String } */
    #userId;

    /** @type { String } */
    #groupId;

    /// elements
    /** @type { HTMLElement } */
    #messages;

    /** @type { HTMLTextAreaElement } */
    #writeArea;

    /** @type { AxialServiceButton } */
    #sendButton;

    /** @type { HTMLElement } */
    #bubbleHolder;

    /** @type { AxialTypingBubble } */
    #typingBubble;

    /// events
    /** @type { Function } */
    #boundKeydownHandler;

    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundSendHandler;

    /** @type { Function } */
    #boundTypingTimeoutHandler;

    /// socket
    /** @type { Function } */
    #boundSocketOpenHandler;

    /** @type { Function } */
    #boundSocketMessageHandler;

    /** @type { Function } */
    #boundSocketErrorHandler;

    /** @type { Function } */
    #boundSocketCloseHandler;

    constructor()
    {
        super();
        this.classList.add("axial_messaging");
        this.template = "axial-messaging-template";

        this.#boundSocketOpenHandler    = this.#socketOpenHandler.bind(this);
        this.#boundSocketMessageHandler = this.#socketMessageHandler.bind(this);
        this.#boundSocketErrorHandler   = this.#socketErrorHandler.bind(this);
        this.#boundSocketCloseHandler   = this.#socketCloseHandler.bind(this);

        this.#boundKeydownHandler       = this.#keydownHandler.bind(this);
        this.#boundInputHandler         = this.#inputHandler.bind(this);
        this.#boundSendHandler          = this.#sendHandler.bind(this);
        this.#boundTypingTimeoutHandler = this.#typingTimeoutHandler.bind(this);

        
    }

    /**
     *  @type { AxialWebSocket }
     *  @readonly
     */
    get websocket() { return this.#websocket; }

    /**
     * The websocket url. You can define it with the axial-socket attribute.
     * That way the component can directly starts
     * @type { String }
     */
    get socketUrl() { return this.#socketUrl; }
    set socketUrl( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        let isValid = value.trim().startsWith("wss://");
        if( isValid === false )
        {
            throw new TypeError("String must start with the wss:// protocol");
        }

        this.#socketUrl = value.trim();

        if( this.#websocket === undefined )
        {
            this.#createSocket();
        }
    }

    get userId() { return this.#userId; }
    set userId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError(" String value required");
        }
        this.#userId = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#messages = this.shadowRoot.getElementById("messages");
        this.#writeArea = this.shadowRoot.getElementById("writeArea");
        this.#sendButton = this.shadowRoot.getElementById("sendButton");

        this.#writeArea.addEventListener("keydown", this.#boundKeydownHandler);
        this.#writeArea.addEventListener("input", this.#boundInputHandler);

        this.#sendButton.addEventListener("click", this.#boundSendHandler);
        this.#sendButton.enabled = false;

        this.#bubbleHolder = this.shadowRoot.getElementById("bubbleHolder");
        this.#typingBubble = this.shadowRoot.getElementById("typingBubble");

        if( this.#socketUrl !== undefined )
        {
            this.#createSocket();
        }
    }

    /**
     * Create the AxialWebSocket and its listeners
     */
    #createSocket()
    {
        // Silent fail socket already here
        if( this.#websocket ) { return; }

        // check again if #socketUrl isValid
        if( this.#socketUrl === undefined || typeof this.#socketUrl !== "string" || this.#socketUrl.trim().startsWith("wss://") === false )
        {
            throw new Error("Can't initialize the socket. The 'socketUrl' must be a string which start with the 'wss://' protocol");
        }

        this.#websocket = new AxialWebSocket( this.#socketUrl );

        this.#websocket.addEventListener( "socketOpen", this.#boundSocketOpenHandler );
        this.#websocket.addEventListener( "socketMessage", this.#boundSocketMessageHandler );
        this.#websocket.addEventListener( "socketError", this.#boundSocketErrorHandler );
        this.#websocket.addEventListener( "socketClose", this.#boundSocketCloseHandler );

    }

    #socketOpenHandler( event )
    {

    }

    #socketMessageHandler( event )
    {
        const object = JSON.parse( event.detail.message );

        if( object.id === this.#userId ) { return; }

        const type = object.type;
        switch( type )
        {
            case "typing":
                if( object.value === true )
                {
                    this.#showBubble();
                }
                else
                {
                    this.#hideBubble();
                }
            break;

            case "message":
                this.#hideBubble();
                this.#addMessageReceived( object.value );
            break;

            default:
            break;
        }
    }

    #socketErrorHandler( event )
    {

    }

    #socketCloseHandler( event )
    {

    }

    /**
     * 
     * @param { KeyboardEvent } event 
     */
    #keydownHandler( event )
    {
        if( event.key === "Enter" && event.getModifierState("Control") === true )
        {
            console.log("send the message on ctrl + enter");
        }
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputHandler( event )
    {
        if( this.#writeArea.value.trim() !== "" )
        {
            this.#sendButton.enabled = true;
        }
        else
        {
            this.#sendButton.enabled = false;
        }

        window.clearTimeout( this.#typingTimeoutId );
        this.#typingTimeoutId = window.setTimeout( this.#boundTypingTimeoutHandler, this.#typingDelay);

        const object =
        {
            id: this.#userId,
            type: "typing",
            value: true
        };
        const json = JSON.stringify(object);
        this.websocket.send( json );
    }

    #sendHandler( event )
    {
        this.#sendMessage();
    }

    #sendMessage()
    {
        const message = this.#writeArea.value.trim();

        const object = 
        {
            id: this.#userId,
            type: "message",
            value: message
        };
        const json = JSON.stringify( object );

        if( this.websocket )
        {
            this.websocket.send( json );
            this.#addMessageSent( message );
        }

        this.#writeArea.value = "";
        this.#sendButton.enabled = false;
    }

    #addMessageSent( message )
    {
        const sentMessage = new AxialMessage( message, "sent" );
        this.#messages.appendChild( sentMessage );
    }

    #addMessageReceived( message )
    {
        const receivedMessage = new AxialMessage( message, "received" );
        this.#messages.appendChild( receivedMessage );
    }
    
    #typingTimeoutHandler()
    {
        window.clearTimeout( this.#typingTimeoutId );
        const object =
        {
            id: this.#userId,
            type: "typing",
            value: false
        };
        const json = JSON.stringify(object);
        this.websocket.send( json );
    }

    #showBubble()
    {
        this.#typingBubble.start();
        this.#bubbleHolder.style.height = "56px";
    }

    #hideBubble()
    {
        this.#typingBubble.stop();
        this.#bubbleHolder.style.height = "0";
    }

}

window.customElements.define("axial-messaging", AxialMessaging);
export { AxialMessaging }