"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialButtonBase extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_button_base");
    }

    connectedCallback()
    {
        super.connectedCallback();
    }
}

window.customElements.define("axial-button-base", AxialButtonBase);

export { AxialButtonBase }