"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

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
    #receivedBackgroundColor = "#232323";

    /** @type { String } */
    #sentTextColor = "#fff";

    /** @type { String } */
    #receivedTextColor = "#fff";


    /// elements
    /** @type { HTMLElement } */
    #content;


    constructor( message = "", type = "sent" )
    {
        super();
        this.classList.add("axial_message");
        this.template = "axial-message-template";

        if( message.trim() !== "" )
        {
            this.#text = message;
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