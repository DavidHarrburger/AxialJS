"use strict";

import { AxialToggleButtonBase } from "../button/AxialToggleButtonBase.js";

class AxialAccordionToggle extends AxialToggleButtonBase
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
    #iconToggle;

    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLSlotElement } */
    #iconSlot;

    /** @type { HTMLSlotElement } */
    #iconToggleSlot;

    /// vars
    /** @type { String } */
    #text = "";

    /** @type { Number } */
    #iconSpace = 10;

    /** @type { Boolean } */
    #hasIcon = false;

    /** @type { Boolean } */
    #hasIconToggle = false;

    /** @type { String } */
    #iconPosition = "left";

    /** @type { Set<String> } */
    #iconPositions = new Set( [ "left", "right", "top", "bottom" ] );

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_button");
        this.template = "axial-toggle-button-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
    }

    static get observedAttributes()
    {
        return [ "axial-text", "axial-icon-position" ];
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

    _buildComponent()
    {
        super._buildComponent();

        this.#background = this.shadowRoot.getElementById("background");
        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#content = this.shadowRoot.getElementById("content");
        this.#icon = this.shadowRoot.getElementById("icon");
        this.#iconToggle = this.shadowRoot.getElementById("iconToggle");
        
        this.#label = this.shadowRoot.getElementById("label");
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
        
        this.#iconSlot = this.shadowRoot.getElementById("iconSlot");
        this.#iconToggleSlot = this.shadowRoot.getElementById("iconToggleSlot");

        const slotElements = this.#iconSlot.assignedElements( { flatten: true } );
        if( slotElements.length > 0 ) { this.#hasIcon = true; }

        const slotToggleElements = this.#iconToggleSlot.assignedElements( { flatten: true } );
        if( slotToggleElements.length > 0 ) { this.#hasIconToggle = true; }

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
            }
        }

        if( name === "axial-icon-position" )
        {
            if( this.#iconPositions.has(newValue) === true )
            {
                this.#iconPosition = newValue;
            }
        }
    }

    ///
    /// LAYOUT
    ///

    #layoutComponent()
    {
        // consider to move the layout of the content in a separated switch
        //const slotElements = this.#iconSlot.assignedElements( { flatten: true } );
        if( this.#hasIcon === false && this.#icon )
        {
            this.#icon.style.marginLeft = "0px";
            this.#icon.style.marginRight = "0px";
            this.#icon.style.marginTop = "0px";
            this.#icon.style.marginBottom = "0px";

            if( this.#iconToggle )
            {
                this.#iconToggle.style.marginLeft = "0px";
                this.#iconToggle.style.marginRight = "0px";
                this.#iconToggle.style.marginTop = "0px";
                this.#iconToggle.style.marginBottom = "0px";
            }
        }
        else
        {
            if( this.#text === "" )
            {
                this.#icon.style.marginLeft = "0px";
                this.#icon.style.marginRight = "0px";
                this.#icon.style.marginTop = "0px";
                this.#icon.style.marginBottom = "0px";

                if( this.#iconToggle )
                {
                    this.#iconToggle.style.marginLeft = "0px";
                    this.#iconToggle.style.marginRight = "0px";
                    this.#iconToggle.style.marginTop = "0px";
                    this.#iconToggle.style.marginBottom = "0px";
                }
                
            }
            else
            {
                switch( this.#iconPosition )
                {
                    case "left":
                        this.#content.style.flexDirection = "row";

                        this.#icon.style.marginLeft = "0px";
                        this.#icon.style.marginRight = String( this.#iconSpace ) + "px";
                        this.#icon.style.marginTop = "0px";
                        this.#icon.style.marginBottom = "0px";

                        if( this.#iconToggle )
                        {
                            this.#iconToggle.style.marginLeft = "0px";
                            this.#iconToggle.style.marginRight = String( this.#iconSpace ) + "px";
                            this.#iconToggle.style.marginTop = "0px";
                            this.#iconToggle.style.marginBottom = "0px";
                        }
                    break;
    
                    case "right":
                        this.#content.style.flexDirection = "row-reverse";

                        this.#icon.style.marginLeft = String( this.#iconSpace ) + "px";
                        this.#icon.style.marginRight = "0px";
                        this.#icon.style.marginTop = "0px";
                        this.#icon.style.marginBottom = "0px";
                        
                        if( this.#iconToggle )
                        {
                            this.#iconToggle.style.marginLeft = String( this.#iconSpace ) + "px";
                            this.#iconToggle.style.marginRight = "0px";
                            this.#iconToggle.style.marginTop = "0px";
                            this.#iconToggle.style.marginBottom = "0px";
                        }
                    break;
    
                    case "top":
                        this.#content.style.flexDirection = "column";

                        this.#icon.style.marginLeft = "0px";
                        this.#icon.style.marginRight = "0px";
                        this.#icon.style.marginTop = "0px";
                        this.#icon.style.marginBottom = String( this.#iconSpace ) + "px";

                        if( this.#iconToggle )
                        {
                            this.#iconToggle.style.marginLeft = "0px";
                            this.#iconToggle.style.marginRight = "0px";
                            this.#iconToggle.style.marginTop = "0px";
                            this.#iconToggle.style.marginBottom = String( this.#iconSpace ) + "px";
                        }
                    break;
    
                    case "bottom":
                        this.#content.style.flexDirection = "column-reverse";

                        this.#icon.style.marginLeft = "0px";
                        this.#icon.style.marginRight = "0px";
                        this.#icon.style.marginTop = String( this.#iconSpace ) + "px";
                        this.#icon.style.marginBottom = "0px";

                        if( this.#iconToggle )
                        {
                            this.#iconToggle.style.marginLeft = "0px";
                            this.#iconToggle.style.marginRight = "0px";
                            this.#iconToggle.style.marginTop = String( this.#iconSpace ) + "px";
                            this.#iconToggle.style.marginBottom = "0px";
                        }
                    break;
    
                    // just in case
                    default:
                        this.#content.style.flexDirection = "row";

                        this.#icon.style.marginLeft = "0px";
                        this.#icon.style.marginRight = "0px";
                        this.#icon.style.marginTop = "0px";
                        this.#icon.style.marginBottom = "0px";

                        if( this.#iconToggle )
                        {
                            this.#iconToggle.style.marginLeft = "0px";
                            this.#iconToggle.style.marginRight = "0px";
                            this.#iconToggle.style.marginTop = "0px";
                            this.#iconToggle.style.marginBottom = "0px";
                        }
                    break;
                }              
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

            if( this.#icon && this.#hasIcon === true )
            {
                this.#icon.style.display = "block";
            }

            if( this.#iconToggle )
            {
                this.#iconToggle.style.display = "none";
            }
        }
        else
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "1";
            }

            if( this.#iconToggle && this.#hasIconToggle === true )
            {
                this.#iconToggle.style.display = "block";
                if( this.#icon && this.#hasIcon === true )
                {
                    //console.log(this.selected, "should hide icon")
                    this.#icon.style.display = "none";
                }
            }
            else
            {
                if( this.#icon && this.#hasIcon === true )
                {
                    this.#icon.style.display = "block";
                }
            }
        }
    }
}

window.customElements.define("axial-accordion-toggle", AxialAccordionToggle);
export { AxialAccordionToggle }
