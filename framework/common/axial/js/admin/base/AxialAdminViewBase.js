"use strict"

import { AxialViewBase } from "../../view/AxialViewBase.js";

class AxialAdminViewBase extends AxialViewBase
{
    constructor()
    {
        super();
        this.classList.add("axial_admin_view_base");
    }
}
window.customElements.define("axial-admin-view-base", AxialAdminViewBase);
export { AxialAdminViewBase }