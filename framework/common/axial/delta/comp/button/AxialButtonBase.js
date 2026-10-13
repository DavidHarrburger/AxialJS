"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialButtonBase extends AxialComponentBase
{
    /// vars
    /** @type { Boolean } */
    #enabled = true;

    constructor()
    {
        super();
        this.classList.add("axial_button_base");
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( this.#enabled === value ) { return; }
        this.#enabled = value;

        if( this.#enabled === true )
        {
            this.style.pointerEvents = "all";
            this.style.opacity = "1";
        }
        else
        {
            this.style.pointerEvents = "none";
            this.style.opacity = "0.5";
        }
    }
}

window.customElements.define("axial-button-base", AxialButtonBase);
export { AxialButtonBase }