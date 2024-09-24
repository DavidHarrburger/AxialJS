"use strict"

import { AxialToggleButton } from "../../button/AxialToggleButton.js";

class AxialTogglePanelButton extends AxialToggleButton
{
    constructor()
    {
        super();
        this.classList.add("axial_toggle_panel_button");
        this.template = "axial-toggle-panel-button-template";
    }
}
window.customElements.define("axial-toggle-panel-button", AxialTogglePanelButton);
export { AxialTogglePanelButton }