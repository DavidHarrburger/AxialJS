"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleCheck extends AxialToggleButtonBase
{
    /// vars
    /** @type { String } */
    #unselectedScale = "scale(0)";

    /** @type { String } */
    #selectedScale = "scale(1)";

    /** @type { Number } */
    #radiusScaleDownFactor = 3;

    #CHECK_POSITIONS = new Set( [ "left", "right" ] );

    /** @type { String } */
    #text = "";

    /** @type { Number } */
    #radius;

    /** @type { Number } */
    #gap = 12;

    /// elements
    /** @type { HTMLElement } */
    #sign;

    /** @type { HTMLElement } */
    #label;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_check");
        this.template = "axial-toggle-check-template";
    }

    static get observedAttributes()
    {
        return ["axial-text", "axial-check-position", "axial-theme", "axial-color", "axial-size", "axial-weight", "axial-style", "axial-gap", "axial-radius" ];
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#sign = this.shadowRoot.getElementById("signElement");
        this.#label = this.shadowRoot.getElementById("labelElement");

        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
            this.#label.style.display = this.#text === "" ? "none" : "block";
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
    }
    
    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#sign )
        {
            if( this.selected === true )
            {
                this.#sign.style.transform = this.#selectedScale;
            }
            else
            {
                this.#sign.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-check", AxialToggleCheck);
export { AxialToggleCheck }