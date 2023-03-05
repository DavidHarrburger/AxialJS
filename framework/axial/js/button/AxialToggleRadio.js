"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase";

class AxialToggleRadio extends AxialToggleButtonBase
{
    /** @type { HTMLElement } */
    #circle;

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
        this.#circle = this.shadowRoot.getElementById("circle");
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