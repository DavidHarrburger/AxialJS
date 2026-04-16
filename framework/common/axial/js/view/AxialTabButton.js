"use strict";

import { AxialButton } from "../button/AxialButton.js";

class AxialTabButton extends AxialButton
{
    constructor()
    {
        super();
        this.classList.remove("axial_toggle_button");
        this.classList.add("axial_tab_button");
        this.template = "axial-tab-button-template";
    }
    
    _buildComponent()
    {
        super._buildComponent();

    }
}

window.customElements.define("axial-tab-button", AxialTabButton);
export { AxialTabButton }