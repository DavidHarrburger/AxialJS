"use strict"

import { AxialToggleButtonBase } from "../button/AxialToggleButtonBase.js";

class AxialDropdownToggle extends AxialToggleButtonBase
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
    #check;

    /** @type { HTMLElement } */
    #label;

    /// vars
    /** @type { String } */
    #text = "";

    /** @type { Number } */
    #iconSpace = 8;

    /** @type { Number } */
    #iconWidth = 18;

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_dropdown_toggle")
        this.template = "axial-dropdown-toggle-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
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

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#background = this.shadowRoot.getElementById("background");
        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#content = this.shadowRoot.getElementById("content");
        this.#icon = this.shadowRoot.getElementById("icon");
        this.#check = this.shadowRoot.getElementById("check");
        
        this.#label = this.shadowRoot.getElementById("label");
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
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
        if( this.selected === false )
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "1";
            }
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        if( this.selected === false )
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "0";
            }
        }
    }

    _onToggleChanged()
    {
        if( this.selected === false )
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "0";
            }

            if( this.#icon )
            {
                this.#icon.style.width = "0px";
                this.#icon.style.marginRight = "0px";
            }

            if( this.#check )
            {
                this.#check.style.transform = "scale(0)";
            }
        }
        else
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "1";
            }

            if( this.#icon )
            {
                this.#icon.style.width = String(this.#iconWidth) + "px";
                this.#icon.style.marginRight = String(this.#iconSpace) + "px";
            }

            if( this.#check )
            {
                this.#check.style.transform = "scale(1)";
            }

        }
    }
    
}
window.customElements.define("axial-dropdown-toggle", AxialDropdownToggle);
export { AxialDropdownToggle }