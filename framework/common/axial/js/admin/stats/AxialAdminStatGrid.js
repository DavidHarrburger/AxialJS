"use strict"

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";

class AxialAdminStatGrid extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        this.template = "axial-admin-stat-grid-template";
    }

    getAllStats()
    {
        console.log("get all stats");
    }
}

window.customElements.define("axial-admin-stat-grid", AxialAdminStatGrid);
export { AxialAdminStatGrid }