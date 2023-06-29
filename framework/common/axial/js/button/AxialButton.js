"use strict"

import { AxialButtonBase  } from "./AxialButtonBase";

class AxialButton extends AxialButtonBase
{
    /** @type { HTMLElement } */
    #labelElement;

    /**
     * @type { String }
     */
    #label = "Label";

    constructor()
    {
        super();
        this.classList.add("axial_button");
        this.template = "axial-button-template";
    }

    static get observedAttributes()
    {
        return ["axial-label"];
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
}

window.customElements.define("axial-button", AxialButton);

export { AxialButton }