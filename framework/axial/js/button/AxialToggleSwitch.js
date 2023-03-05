"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase";

class AxialToggleSwitch extends AxialToggleButtonBase
{
    /** @type { HTMLElement } */
    #circle;

    #unselectedLeft = "0px";
    #selectedLeft = "30px";

    constructor()
    {
        super();
        this.classList.add("axial_toggle_switch");
        this.template = "axial-toggle-switch-template";
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
                this.#circle.style.left = this.#selectedLeft;
            }
            else
            {
                this.#circle.style.left = this.#unselectedLeft;
            }
        }
    }
}

window.customElements.define("axial-toggle-switch", AxialToggleSwitch);
export { AxialToggleSwitch }