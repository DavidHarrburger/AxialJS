"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialView extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_view");
        this.template = "axial-view-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}
window.customElements.define("axial-view", AxialView);
export { AxialView }