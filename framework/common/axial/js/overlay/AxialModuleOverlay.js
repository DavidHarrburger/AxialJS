"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";

// rename ModuleOverlayView
class AxialModuleOverlay extends AxialOverlayBase
{
    /** @type { HTMLSlotElement} */
    #slot;

    constructor()
    {
        super();
        this.classList.add("axial_module_overlay");
        this.template = "axial-module-overlay-template";

        this.useObfuscator = true;
        this.isModal = false;
        this.useOpacity = false;

        this.displayMode = "window";
        this.position = "bottom-center";
        this.offset = 0;
        this.transformDecay = 100;
    }

    _buildComponent()
    {
        super._buildComponent();
    }

}
window.customElements.define("axial-module-overlay", AxialModuleOverlay);
export { AxialModuleOverlay }