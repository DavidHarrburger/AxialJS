"use strict";

import { AxialListOverlay } from "../overlay/AxialListOverlay.js";

class AxialTabBarContext extends AxialListOverlay
{
    constructor()
    {
        super();
        this.template = "axial-tab-bar-context-template";
        this.displayMode = "context";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-tab-bar-context", AxialTabBarContext);
export { AxialTabBarContext }