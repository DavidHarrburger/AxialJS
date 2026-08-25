"use strict";

import { AxialButton } from "../button/AxialButton.js";

class AxialListOverlayButton extends AxialButton
{
    constructor()
    {
        super();
        this.classList.add("axial_list_overlay_button");
        this.template = "axial-list-overlay-button-template";
    }
}

window.customElements.define("axial-list-overlay-button", AxialListOverlayButton);
export { AxialListOverlayButton }