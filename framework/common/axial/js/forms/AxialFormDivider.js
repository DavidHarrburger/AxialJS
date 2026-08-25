"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialFormDivider extends AxialComponentBase
{
    /** @type { String } */
    #titleText;

    /** @type { HTMLElement } */
    #title;

    constructor()
    {
        super();
        this.classList.add("axial_form_divider");
        this.template= "axial-form-divider-template";
    }

    static get observedAttributes()
    {
        return [ "axial-title" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-title" )
        {
            this.#titleText = newValue;
            if( this.#title )
            {
                this.#title.innerHTML = this.#titleText;
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#title = this.shadowRoot.getElementById("title");
        if( this.#title && this.#titleText )
        {
            this.#title.innerHTML = this.#titleText;
        }
    }
}

window.customElements.define("axial-form-divider", AxialFormDivider);
export { AxialFormDivider }