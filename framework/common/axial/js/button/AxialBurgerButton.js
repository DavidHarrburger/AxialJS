"use strict";

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialBurgerButton extends AxialToggleButtonBase
{
    /// vars
    /** @type { Number } */
    #topPosition = 13;

    /** @type { Number } */
    #middlePosition = 20.5;

    /** @type { Number } */
    #bottomPosition = 27;

    /** @type { Number } */
    #lineWidth = 22;

    /** @type { String } */
    #borderColor;

    /** @type { String } */
    #backgroundColor;

    /** @type { String } */
    #foregroundColor;

    /** @type { String } */
    #topLineColor;

    /** @type { String } */
    #middleLineColor;

    /** @type { String } */
    #bottomLineColor;

    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #foreground;

    /** @type { HTMLElement} */
    #border;

    /** @type { HTMLElement } */
    #top;

    /** @type { HTMLElement } */
    #middle;

    /** @type { HTMLElement } */
    #bottom;

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_burger_button");
        this.template = "axial-burger-button-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
    }

    static get observedAttributes()
    {
        return ["axial-border", "axial-line-top", "axial-line-middle", "axial-line-bottom", "axial-background", "axial-foreground" ];
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#border = this.shadowRoot.getElementById("border");
        this.#background = this.shadowRoot.getElementById("background");
        this.#foreground = this.shadowRoot.getElementById("foreground");

        this.#top = this.shadowRoot.getElementById("top");
        this.#middle = this.shadowRoot.getElementById("middle");
        this.#bottom = this.shadowRoot.getElementById("bottom");

        if( this.#border )
        {
            if( this.#borderColor !== undefined )
            {
                this.#border.style.borderColor = this.#borderColor;
            }
            else
            {
                this.#borderColor = window.getComputedStyle( this.#border ).borderColor;
            }
        }

        if( this.#background )
        {
            if( this.#backgroundColor !== undefined )
            {
                this.#background.style.backgroundColor = this.#backgroundColor;
            }
            else
            {
                this.#backgroundColor = window.getComputedStyle( this.#background ).backgroundColor;
            }
        }

        if( this.#foreground )
        {
            if( this.#foregroundColor !== undefined )
            {
                this.#foreground.style.backgroundColor = this.#foregroundColor;
            }
            else
            {
                this.#backgroundColor = window.getComputedStyle( this.#background ).backgroundColor;
            }
        }

        if( this.#top )
        {
            if( this.#topLineColor !== undefined )
            {
                this.#top.style.backgroundColor = this.#topLineColor;
            }
            else
            {
                this.#topLineColor = window.getComputedStyle( this.#top ).backgroundColor;
            }
        }

        if( this.#middle )
        {
            if( this.#middleLineColor !== undefined )
            {
                this.#middle.style.backgroundColor = this.#middleLineColor;
            }
            else
            {
                this.#middleLineColor = window.getComputedStyle( this.#middle ).backgroundColor;
            }
        }

        if( this.#bottom )
        {
            if( this.#bottomLineColor !== undefined )
            {
                this.#bottom.style.backgroundColor = this.#bottomLineColor;
            }
            else
            {
                this.#bottomLineColor = window.getComputedStyle( this.#bottom ).backgroundColor;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);

        if( name === "axial-border" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#borderColor = newValue; }
            if( this.#border ) { this.#border.style.borderColor = this.#borderColor; }
        }

        if( name === "axial-line-top" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#topLineColor = newValue;  }
            if( this.#top ) { this.#top.style.backgroundColor = this.#topLineColor; }
        }

        if( name === "axial-line-middle" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#middleLineColor = newValue;  }
            if( this.#middle ) { this.#middle.style.backgroundColor = this.#middleLineColor; }
        }

        if( name === "axial-line-bottom" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#bottomLineColor = newValue;  }
            if( this.#bottom ) { this.#bottom.style.backgroundColor = this.#bottomLineColor; }
        }

        if( name === "axial-foreground" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#foregroundColor = newValue;  }
            if( this.#foreground ) { this.#foreground.style.backgroundColor = this.#foregroundColor; }
        }

        if( name === "axial-background" )
        {
            const validColor = CSS.supports("color", newValue);
            if( validColor === true ) { this.#backgroundColor = newValue;  }
            if( this.#background ) { this.#background.style.backgroundColor = this.#backgroundColor; }
        }
    }

    _onToggleChanged()
    {
        super._onToggleChanged();

        if( this.selected === true )
        {
            this.#middle.style.transform = "scaleX(0)";

            this.#top.style.top = String(this.#middlePosition) + "px";
            this.#top.style.transform = "rotate(45deg)";

            this.#bottom.style.top = String(this.#middlePosition) + "px";
            this.#bottom.style.transform = "rotate(-45deg)";
            
        }
        else
        {
            this.#middle.style.transform = "scaleX(1)";

            this.#top.style.top = String(this.#topPosition) + "px";
            this.#top.style.transform = "rotate(0deg)";

            this.#bottom.style.top = String(this.#bottomPosition) + "px";
            this.#bottom.style.transform = "rotate(0deg)";
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
        if( event.pointerType === "mouse" )
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
        if( event.pointerType === "mouse" )
        {
            if( this.#foreground )
            {
                this.#foreground.style.opacity = "0";
            }
        }
    }
}

window.customElements.define("axial-burger-button", AxialBurgerButton);
export { AxialBurgerButton }