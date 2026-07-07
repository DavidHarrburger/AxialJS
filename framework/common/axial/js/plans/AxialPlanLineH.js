"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanLineH extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_plan_line_h");
        this.template = "axial-plan-line-h-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-plan-line-h", AxialPlanLineH);
export { AxialPlanLineH }