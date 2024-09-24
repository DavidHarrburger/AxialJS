"use strict"

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminStatGrid } from "./AxialAdminStatGrid.js";

class AxialAdminStatView extends AxialAdminViewBase
{

    /** @type { AxialAdminStatGrid } */
    #statGrid;
    
    constructor()
    {
        super();
        this.template = "axial-admin-stat-view-template";
    }

    _onViewEntered()
    {
        if( this.#statGrid ) { this.#statGrid.getAllStats(); }
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#statGrid = this.shadowRoot.getElementById("statGrid");
    }


}
window.customElements.define("axial-admin-stat-view", AxialAdminStatView);
export { AxialAdminStatView }