"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialView extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_view");
        this.template = "axial-view-template";
    }
}
window.customElements.define("axial-view", AxialView);
export { AxialView }