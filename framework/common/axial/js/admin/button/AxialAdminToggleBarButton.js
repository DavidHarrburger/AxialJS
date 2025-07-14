"use strict";

import { AxialToggleButton } from "../../button/AxialToggleButton.js";

class AxialAdminToggleBarButton extends AxialToggleButton
{
    constructor()
    {
        super();
        this.classList.add("axial_admin_toggle_bar_button");
        this.template = "axial-admin-toggle-bar-button-template";
    }
}
window.customElements.define("axial-admin-toggle-bar-button", AxialAdminToggleBarButton);
export { AxialAdminToggleBarButton }