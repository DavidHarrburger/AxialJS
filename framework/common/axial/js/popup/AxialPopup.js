"use strict";

import { AxialPopupBase } from "./AxialPopupBase.js";

class AxialPopup extends AxialPopupBase
{
    constructor()
    {
        super();
        this.classList.add("axial_popup");
        this.template = "axial-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-popup", AxialPopup);
export { AxialPopup }