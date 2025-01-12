"use strict";

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleSwitch extends AxialToggleButtonBase
{
    /// vars
    /** @type { String } */
    #unselectedLeft = "0";

    /** @type { String } */
    #selectedLeft = "16px";

    /** @type { String } */
    #unselectedScale = "scale(0)";

    /** @type { String } */
    #selectedScale = "scale(1.1)";

    /// elements
    /** @type { HTMLElement } */
    #circle;

    /** @type { HTMLElement } */
    #inner;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_switch");
        this.template = "axial-toggle-switch-template";
    }

    _buildComponent()
    {
        this.#circle = this.shadowRoot.getElementById("circle");
        this.#inner = this.shadowRoot.getElementById("inner");
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

        if( this.#inner )
        {
            if( this.selected === true )
            {
                this.#inner.style.transform = this.#selectedScale;
            }
            else
            {
                this.#inner.style.transform = this.#unselectedScale;
            }
        }
    }
}

window.customElements.define("axial-toggle-switch", AxialToggleSwitch);
export { AxialToggleSwitch }