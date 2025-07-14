"use strict";

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleSwitch extends AxialToggleButtonBase
{
    /// vars
    /** @type { String } */
    #unselectedLeft = "0";

    /** @type { String } */
    #selectedLeft = "16px";

    /** @type { String } */
    #unselectedScale = "scale(0)";

    /** @type { String } */
    #selectedScale = "scale(1.1)";

    /// styles
    /** @type { String } */
    #themeColor = "";
    
    /** @type { String } */
    #borderColor = "";

    /// elements
    /** @type { HTMLElement } */
    #circle;

    /** @type { HTMLElement } */
    #inner;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_switch");
        this.template = "axial-toggle-switch-template";
    }

    static get observedAttributes()
    {
        return [ "axial-theme", "axial-border" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);

        if( name === "axial-theme" )
        {
            this.#themeColor = newValue;
            if( this.#inner ) { this.#inner.style.backgroundColor = this.#themeColor; }
        }

        if( name === "axial-border" )
        {
            this.#borderColor = newValue;
            if( this.#inner ) { this.#inner.style.color = this.#borderColor; }
        }
    }

    _buildComponent()
    {
        this.#circle = this.shadowRoot.getElementById("circle");
        this.#inner = this.shadowRoot.getElementById("inner");

        if( this.#themeColor === "" )
        {
            this.#themeColor = window.getComputedStyle( this ).color;
        }
    }

    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#circle )
        {
            if( this.selected === true )
            {
                this.#circle.style.left = this.#selectedLeft;
            }
            else
            {
                this.#circle.style.left = this.#unselectedLeft;
            }
        }

        if( this.selected === true )
        {
            this.style.backgroundColor = this.#themeColor;
        }
        else
        {
            this.style.backgroundColor = "#fff";
        }

        if( this.#inner )
        {
            if( this.selected === true )
            {
                this.#inner.style.transform = this.#selectedScale;
            }
            else
            {
                this.#inner.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-switch", AxialToggleSwitch);
export { AxialToggleSwitch }