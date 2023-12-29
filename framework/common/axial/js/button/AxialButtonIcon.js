"use strict"

import { AxialButtonBase  } from "./AxialButtonBase.js";

class AxialButtonIcon extends AxialButtonBase
{
    /** @type { HTMLElement } */
    #labelElement;

    /** @type { HTMLElement } */
    #iconElement;

    /**
     * @type { String }
     */
    #label = "Label";

    /**
     * @type { String }
     */
    #icon = "";

    constructor()
    {
        super();
        this.classList.add("axial_button_icon");
        this.template = "axial-button-icon-template";
    }

    static get observedAttributes()
    {
        return ["axial-label", "axial-icon"];
    }

    connectedCallback()
    {
        this.#labelElement = this.shadowRoot.getElementById("labelElement");

        const tempLabel = this.getAttribute("axial-label");
        if( tempLabel !== null )
        {
            this.#label = tempLabel;
            if( this.#labelElement )
            {
                this.#labelElement.innerHTML = tempLabel;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        if( this.isConnected === false ) { return; }
        if( name == "axial-label" && this.#labelElement )
        {
            this.#label = newValue;
            this.#labelElement.innerHTML = newValue;
        }
    }

    get label() { return this.#label; }
    set label( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#label == value ) { return; }
        this.#label = value;
        if( this.#labelElement )
        {
            this.#labelElement.innerHTML = this.#label;
        }
    }
}

window.customElements.define("axial-button-icon", AxialButtonIcon);

export { AxialButtonIcon }