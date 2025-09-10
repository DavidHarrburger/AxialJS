"use strict";

import { AxialButtonBase  } from "./AxialButtonBase.js";

class AxialButton extends AxialButtonBase
{
    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #foreground;

    /** @type { HTMLElement} */
    #content;

    /** @type { HTMLElement} */
    #border;

    /** @type { HTMLElement } */
    #icon;

    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLSlotElement } */
    #iconSlot;

    /// vars
    /** @type { String } */
    #text = "";

    /** @type { Number } */
    #gap = 10;

    /** @type { String } */
    #iconPosition = "left";

    /** @type { Set<String> } */
    #iconPositions = new Set( [ "left", "right", "top", "bottom" ] );

    /** @type { Set<String> } */
    #styles = new Set( [ "normal", "border" ] );

    /** @type { String } */
    #style = "normal";

    /** @type { Set<String> } */
    #aligns = new Set( [ "flex-start", "center", "flex-end" ] );

    /** @type { String } */
    #align = "center";

    /** @type { String } */ // computed
    #themeColor = "";

    /** @type { String } */ // computed
    #textColor = "";

    /** @type { String } */ // computed
    #textSize = "";

    /** @type { String } */ // computed
    #textWeight = "";

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_button");
        this.template = "axial-button-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
    }

    static get observedAttributes()
    {
        return ["axial-text", "axial-icon-position", "axial-theme", "axial-color", "axial-size", "axial-weight", "axial-align", "axial-style", "axial-gap" ];
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#background = this.shadowRoot.getElementById("background");
        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#content = this.shadowRoot.getElementById("content");
        this.#border = this.shadowRoot.getElementById("border");
        this.#label = this.shadowRoot.getElementById("label");
        this.#icon = this.shadowRoot.getElementById("icon");

        if( this.#background )
        {
            if( this.#themeColor != "" )
            {
                this.#background.style.backgroundColor = this.#themeColor;
            }
            else
            {
                this.#themeColor = window.getComputedStyle( this.#background ).backgroundColor;
            }
        }

        if( this.#content )
        {
            this.#content.style.justifyContent = this.#align;
            this.#content.style.gap = this.#gap + "px";
        }
        
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
            if( this.#textColor != "" )
            {
                this.#label.style.color = this.#textColor;
            }
            else
            {
                this.#textColor = window.getComputedStyle( this.#label ).color;
            }

            if( this.#textSize != "" )
            {
                this.#label.style.fontSize = this.#textSize;
            }
            else
            {
                this.#textSize = window.getComputedStyle( this.#label ).fontSize;
            }

            if( this.#textWeight != "" )
            {
                this.#label.style.fontWeight = this.#textWeight;
            }
            else
            {
                this.#textWeight = window.getComputedStyle( this.#label ).fontWeight;
            }

            this.#label.style.display = this.#text === "" ? "none" : "block";
        }
        
        this.#iconSlot = this.shadowRoot.getElementById("iconSlot");

        this.#layoutComponent();
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
                this.#label.style.display = this.#text === "" ? "none" : "block";
            }
        }

        if( name === "axial-icon-position" )
        {
            if( this.#iconPositions.has(newValue) === true )
            {
                this.#iconPosition = newValue;
            }
        }

        if( name === "axial-theme" )
        {
            this.#themeColor = newValue;
            if( this.#background ) { this.#background.style.backgroundColor = this.#themeColor; }
        }

        if( name === "axial-color" )
        {
            this.#textColor = newValue;
            if( this.#label ) { this.#label.style.color = this.#textColor; }
        }

        if( name === "axial-align" )
        {
            if( this.#aligns.has( newValue ) && this.#align !== newValue )
            {
                this.#align = newValue;
            }
        }

        if( name === "axial-weight" )
        {
            this.#textWeight = newValue;
            if( this.#label ) { this.#label.style.fontWeight = this.#textWeight; }
        }

        if( name === "axial-size" )
        {
            this.#textSize = newValue;
            if( this.#label ) { this.#label.style.fontSize = this.#textSize; }
        }

        if( name === "axial-gap" )
        {
            this.#gap = isNaN( Number(newValue) ) === true ? 10 : Number(newValue);
            if( this.#content ) { this.#content.style.gap = String(this.#gap) + "px"; }
        }
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
            this.#label.style.display = this.#text === "" ? "none" : "block";
        }
    }

    ///
    /// LAYOUT
    ///

    #layoutComponent()
    {
        const slotElements = this.#iconSlot.assignedElements( { flatten: true } );
        this.#icon.style.display = slotElements.length === 0 ? "none" : "block";

        if( slotElements.length > 0 )
        {
            let dir = "row";
            switch( this.#iconPosition )
            {
                case "left":
                    dir = "row";
                break;

                case "right":
                    dir = "row-reverse";
                break;

                case "top":
                    dir = "column";
                break;

                case "bottom":
                    dir = "column-reverse";
                break;

                default:
                    dir = "row";
                break;
            }
            this.#content.style.flexDirection = dir;
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

}

window.customElements.define("axial-button", AxialButton);
export { AxialButton }