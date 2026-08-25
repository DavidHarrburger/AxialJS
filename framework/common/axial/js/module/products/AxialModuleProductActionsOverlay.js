"use strict";

import { AxialModuleOverlay } from "../../overlay/AxialModuleOverlay.js";
import { AxialModuleProductView } from "./AxialModuleProductView.js";

class AxialModuleProductActionsOverlay extends AxialModuleOverlay
{
    constructor()
    {
        super();

        this.classList.add("axial_module_product_actions_overlay");
        this.template = "axial-module-product-actions-overlay-template";

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

window.customElements.define("axial-module-product-actions-overlay", AxialModuleProductActionsOverlay);
export { AxialModuleProductActionsOverlay }