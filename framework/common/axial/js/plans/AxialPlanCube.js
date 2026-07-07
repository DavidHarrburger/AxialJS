"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanCube extends AxialComponentBase
{
    

    constructor()
    {
        super();
        this.classList.add("axial_plan_cube");
        this.template = "axial-plan-cube-template";
    }
}

window.customElements.define("axial-plan-cube", AxialPlanCube);
export { AxialPlanCube }