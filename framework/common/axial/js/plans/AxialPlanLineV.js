"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanLineV extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_plan_line_v");
        this.template = "axial-plan-line-v-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-plan-line-v", AxialPlanLineV);
export { AxialPlanLineV }