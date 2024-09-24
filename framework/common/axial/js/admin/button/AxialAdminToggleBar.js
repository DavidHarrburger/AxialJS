"use strict"

import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";

class AxialAdminToggleBar extends AxialToggleButtonGroupBase
{
    constructor()
    {
        super();
        this.classList.add("axial_admin_toggle_bar");
    }
}

window.customElements.define("axial-admin-toggle-bar", AxialAdminToggleBar);
export { AxialAdminToggleBar }