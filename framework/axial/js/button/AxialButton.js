"use strict"

import { AxialButtonBase  } from "./AxialButtonBase";

class AxialButton extends AxialButtonBase
{
    constructor()
    {
        super();
        this.classList.add("axial_button");
        this.template = "axial-button-template";
    }

    static get observedAttributes()
    {
        return ["ax-label"];
    }
}

window.customElements.define("axial-button", AxialButton);

export { AxialButton }