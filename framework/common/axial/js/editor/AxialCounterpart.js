"use strict";

import { AxialCounterpartBase } from "./AxialCounterpartBase.js";

class AxialCounterpart extends AxialCounterpartBase
{
    constructor()
    {
        super();
        this.classList.add("axial_counterpart");
        this.template = "axial-counterpart-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-counterpart", AxialCounterpart);
export { AxialCounterpart }