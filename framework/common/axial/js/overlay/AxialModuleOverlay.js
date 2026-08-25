"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";

class AxialModuleOverlay extends AxialOverlayBase
{
    constructor()
    {
        super();
        this.classList.add("axial_module_overlay");
        this.template = "axial-module-overlay-template";
    }


}
window.customElements.define("axial-module-overlay", AxialModuleOverlay);
export { AxialModuleOverlay }