"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleCheck extends AxialToggleButtonBase
{
    /** @type { HTMLElement } */
    #signElement;

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
        this.classList.add("axial_toggle_check");
        this.template = "axial-toggle-check-template";
    }

    static get observedAttributes()
    {
        return ["axial-label"];
    }

    connectedCallback()
    {
        super.connectedCallback();
        
        this.#signElement = this.shadowRoot.getElementById("signElement");
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
        
        if( this.#signElement )
        {
            if( this.selected === true )
            {
                this.#signElement.style.transform = this.#selectedScale;
            }
            else
            {
                this.#signElement.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-check", AxialToggleCheck);
export { AxialToggleCheck }