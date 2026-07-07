"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanController extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #coords;

    /// vars

    /// events
    

    constructor()
    {
        super();
        this.classList.add("axial_plan_controller");
        this.template = "axial-plan-controller-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#coords = this.shadowRoot.getElementById("coords");
    }

    updateCoords( x = 0, y = 0 )
    {
        if( this.#coords )
        {
            this.#coords.innerHTML = `${x}  -  ${y}`;
        }
    }
}

window.customElements.define("axial-plan-controller", AxialPlanController);
export { AxialPlanController }