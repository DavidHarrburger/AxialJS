"use strict";

import { AxialComponentBase } from "../../../core/AxialComponentBase.js";

class AxialGridBase extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_grid_base");
    }
}

window.customElements.define("axial-grid-base", AxialGridBase);
export { AxialGridBase }