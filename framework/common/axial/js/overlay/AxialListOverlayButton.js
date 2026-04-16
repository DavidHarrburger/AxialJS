"use strict";

import { AxialButton } from "../button/AxialButton.js";

class AxialListOverlayButton extends AxialButton
{
    constructor()
    {
        super();
        this.textSize = "14px";
        this.textWeight = "500";
        this.textColor = "#111";
        this.themeColor = "#efefef";
    }
}

window.customElements.define("axial-list-overlay-button", AxialListOverlayButton);
export { AxialListOverlayButton }