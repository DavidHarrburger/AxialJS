"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialMessage extends AxialComponentBase
{
    /// vars
    /** @type { Set<String> } */
    #MESSAGE_TYPES = Object.freeze( new Set( [ "sent", "received" ] ) );

    /** @type { String } */
    #messageType = "sent";

    /** @type { String } */
    #text;

    /** @type { String } */
    #sentBackgroundColor = "#ec2426";

    /** @type { String } */
    #receivedBackgroundColor = "var(--colDark)";

    /** @type { String } */
    #sentTextColor = "#fff";

    /** @type { String } */
    #receivedTextColor = "var(--colTextLight)";

    /** @type { Object } */
    #messageObject;

    /// elements
    /** @type { HTMLElement } */
    #content;


    /**
     * 
     * @param { Object } message 
     * @param { String } type 
     */
    constructor( message, type )
    {
        super();
        this.classList.add("axial_message");
        this.template = "axial-message-template";

        if( ObjectUtils.isObject( message ) === false )
        {
            throw new TypeError("Plain Object required");
        }

        this.#messageObject = message;

        if( this.#messageObject.content.trim() !== "" )
        {
            this.#text = this.#messageObject.content;
        }

        if( type && typeof type === "string" && type !== "sent" && this.#MESSAGE_TYPES.has(type) === true )
        {
            this.#messageType = type;
        }
        
    }

    get messageType() { return this.#messageType; }
    set messageType( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#MESSAGE_TYPES.has(value) === false )
        {
            throw new Error("'sent' or 'received' value expected");
        }

        if( this.#messageType === value ) { return; }
        this.#messageType = value;
        this.#layoutMessage();
    }


    _buildComponent()
    {
        super._buildComponent();

        this.#content = this.shadowRoot.getElementById("content");
        if( this.#text )
        {
            this.#content.innerText = this.#text;
        }

        if( this.#messageType === "received" )
        {
            this.style.alignItems = "flex-start";
            this.style.alignSelf = "flex-start";
            this.#content.style.backgroundColor = this.#receivedBackgroundColor;
            this.#content.style.color = this.#receivedTextColor;
        }
    }

    #layoutMessage()
    {
        switch( this.#messageType )
        {
            case "sent":
            break;

            case "received":
            break;

            default:
            break;
        }
    }
}

window.customElements.define("axial-message", AxialMessage);
export { AxialMessage }