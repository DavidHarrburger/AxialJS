"use strict";

import { AxialViewBase } from "./AxialViewBase.js";

class AxialView extends AxialViewBase
{
    /** @type { HTMLElement } */
    #holder;

    constructor()
    {
        super();
        this.classList.add("axial_view");
        this.template = "axial-view-template";
    }

    /**
     * @readonly
     * @type { HTMLElement }
     */
    get holder() { return this.#holder; }

    _buildComponent()
    {
        super._buildComponent();
        this.#holder = this.shadowRoot.getElementById("holder");
    }

}
window.customElements.define("axial-view", AxialView);
export { AxialView }