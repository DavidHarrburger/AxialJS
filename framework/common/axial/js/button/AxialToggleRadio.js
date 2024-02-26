"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleRadio extends AxialToggleButtonBase
{
    /** @type { HTMLElement } */
    #circleElement;

    /** @type { HTMLElement } */
    #labelElement;

    /**
     * @type { String }
     */
    #label = "Label";

    #unselectedScale = "scale(0)";
    #selectedScale = "scale(1)";

    constructor()
    {
        super();
        this.classList.add("axial_toggle_radio");
        this.template = "axial-toggle-radio-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        
        this.#circleElement = this.shadowRoot.getElementById("circleElement");
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

    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#circleElement )
        {
            if( this.selected === true )
            {
                this.#circleElement.style.transform = this.#selectedScale;
            }
            else
            {
                this.#circleElement.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-radio", AxialToggleRadio);
export { AxialToggleRadio }