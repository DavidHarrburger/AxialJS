"use strict"

import { AxialButtonBase  } from "./AxialButtonBase.js";

class AxialServiceButton extends AxialButtonBase
{
    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #foreground;

    /** @type { HTMLElement} */
    #content;

    /** @type { HTMLElement } */
    #icon;

    /** @type { HTMLElement } */
    #indicator;

    /** @type { HTMLElement } */
    #label;

    /// vars
    /** @type { String } */
    #text = "";

    /** @type { Number } */
    #iconSpace = 10;

    /** @type { Number } */
    #iconWidth = 22;

    /** @type { Boolean } */
    #loading = false;

    /** @type { String } */
    #animation = "axialServiceButtonIndicatorAnimation 2s ease 0s infinite";

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_service_button");
        this.template = "axial-service-button-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);
        this.#boundClickHandler = this.#clickHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
        this.addEventListener("click", this.#boundClickHandler);
    }

    static get observedAttributes()
    {
        return [ "axial-template", "axial-text" ];
    }

    get text() { return this.#text; }
    set text( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#text === value ) { return; }
        this.#text = value;
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
    }
    
    get loading() { return this.#loading; }
    set loading( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#loading === value ) { return; }
        this.#loading = value;
        if( this.#loading === true )
        {
            this.style.cursor = "not-allowed";
            if( this.#icon )
            {
                this.#icon.style.width = String(this.#iconWidth) + "px";
                this.#icon.style.marginRight = String(this.#iconSpace) + "px";
            }

            if( this.#indicator )
            {
                this.#indicator.style.animation = this.#animation;
            }
        }
        else
        {
            this.style.cursor = "pointer";
            if( this.#icon )
            {
                this.#icon.style.width = "0";
                this.#icon.style.marginRight = "0";
            }

            if( this.#indicator )
            {
                this.#indicator.style.animation = "none";
            }
        }    
    }

    connectedCallback()
    {
        super.connectedCallback();

        this.#background = this.shadowRoot.getElementById("background");
        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#content = this.shadowRoot.getElementById("content");
        this.#icon = this.shadowRoot.getElementById("icon");
        this.#indicator = this.shadowRoot.getElementById("indicator");
        
        this.#label = this.shadowRoot.getElementById("label");
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }

        //layout if text changed
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-text" )
        {
            this.#text = newValue;
            if( this.#label )
            {
                this.#label.innerHTML = this.#text;
            }
        }
    }

    ///
    /// EVENTS
    ///

    /**
     * 
     * @param { PointerEvent } event 
     */
    #enterHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "1";
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "0";
        }
    }

    /**
     * 
     * @param {PointerEvent} event 
     */
    #clickHandler( event )
    {
        //console.log( event );
        if( this.#loading === true )
        {
            event.stopImmediatePropagation();
        }
    }

}

window.customElements.define("axial-service-button", AxialServiceButton);
export { AxialServiceButton }