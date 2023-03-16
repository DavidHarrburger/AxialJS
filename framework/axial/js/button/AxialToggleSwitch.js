"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase";

class AxialToggleSwitch extends AxialToggleButtonBase
{
    /** @type { HTMLElement } */
    #circleElement;

    #unselectedLeft = "0px";
    #selectedLeft = "15px";

    constructor()
    {
        super();
        this.classList.add("axial_toggle_switch");
        this.template = "axial-toggle-switch-template";
    }

    connectedCallback()
    {
        this.#circleElement = this.shadowRoot.getElementById("circleElement");
    }

    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#circleElement )
        {
            if( this.selected === true )
            {
                this.#circleElement.style.left = this.#selectedLeft;
            }
            else
            {
                this.#circleElement.style.left = this.#unselectedLeft;
            }
        }
    }
}

window.customElements.define("axial-toggle-switch", AxialToggleSwitch);
export { AxialToggleSwitch }