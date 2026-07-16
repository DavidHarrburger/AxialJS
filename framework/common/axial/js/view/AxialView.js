"use strict";

import { AxialViewBase } from "./AxialViewBase.js";

class AxialView extends AxialViewBase
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