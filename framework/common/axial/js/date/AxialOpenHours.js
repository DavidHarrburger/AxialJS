"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialOpenHours extends AxialServiceComponentBase
{
    /** @type { Set } */
    #MODES = new Set( ["full", "half"] );

    /** @type { String } */
    #mode = "half";

    constructor()
    {
        super();
        this.classList.add("axial_open_hours");
        this.template = "axial-open-hours-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-open-hours", AxialOpenHours);
export { AxialOpenHours }