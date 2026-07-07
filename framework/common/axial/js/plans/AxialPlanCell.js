"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanCell extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #normalColor = "#fff";

    /** @type { String } */
    #overColor = "#e7f6ff";

    /** @type { String } */
    #downColor = "#86c3e9";

    /// events
    

    constructor()
    {
        super();
        this.classList.add("axial_plan_cell");
        this.template = "axial-plan-cell-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    setNormal()
    {
        this.style.backgroundColor = this.#normalColor;
    }

    setOver()
    {
        this.style.backgroundColor = this.#overColor;
    }

    setDown()
    {
        this.style.backgroundColor = this.#downColor;
    }
}

window.customElements.define("axial-plan-cell", AxialPlanCell);
export { AxialPlanCell }