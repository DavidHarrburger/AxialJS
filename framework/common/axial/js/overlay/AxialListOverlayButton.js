"use strict";

import { AxialButton } from "../button/AxialButton.js";

class AxialListOverlayButton extends AxialButton
{
    constructor()
    {
        super();
        this.template = "axial-list-overlay-button-template";
    }
}

window.customElements.define("axial-list-overlay-button", AxialListOverlayButton);
export { AxialListOverlayButton }