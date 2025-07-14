"use strict";

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleRadio extends AxialToggleButtonBase
{
    /// vars
    /** @type { String } */
    #text = "Label";

    /** @type { String } */
    #value = "";

    /** @type { String } */
    #unselectedScale = "scale(0)";

    /** @type { String } */
    #selectedScale = "scale(1)";
    
    /// elements
    /** @type { HTMLElement } */
    #border;

    /** @type { HTMLElement } */
    #circle;

    /** @type { HTMLElement } */
    #label;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_radio");
        this.template = "axial-toggle-radio-template";
    }

    static get observedAttributes()
    {
        return [ "axial-text", "axial-value" ];
    }

    _buildComponent()
    {
        this.#border = this.shadowRoot.getElementById("border");
        this.#circle = this.shadowRoot.getElementById("circle");
        this.#label = this.shadowRoot.getElementById("label");

        if( this.#label )
        {
            if( this.#text != "Label" )
            {
                this.#label.innerHTML = this.#text;
            }
        }
    }

    /**
     * @readonly
     */
    get value() { return this.#value; }

    attributeChangedCallback(name, oldValue, newValue)
    {
        if( name === "axial-text" )
        {
            this.#text = newValue;
            if( this.#label )
            {
                this.#label.innerHTML = this.#text;
            }
        }

        if( name === "axial-value" )
        {
            this.#value = newValue;
        }
    }

    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#circle )
        {
            if( this.selected === true )
            {
                this.#circle.style.transform = this.#selectedScale;
            }
            else
            {
                this.#circle.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-radio", AxialToggleRadio);
export { AxialToggleRadio }