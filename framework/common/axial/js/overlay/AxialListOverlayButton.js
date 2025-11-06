"use strict";

import { AxialButton } from "../button/AxialButton.js";

class AxialListOverlayButton extends AxialButton
{
    constructor()
    {
        super();
        
    }
}

window.customElements.define("axial-list-overlay-button", AxialListOverlayButton);
export { AxialListOverlayButton }