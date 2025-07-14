"use strict";

import { AxialToggleButton } from "../../button/AxialToggleButton.js";

class AxialTogglePasswordButton extends AxialToggleButton
{
    constructor()
    {
        super();
        this.classList.add("axial_toggle_password_button");
        this.template = "axial-toggle-password-button-template";
    }
}
window.customElements.define("axial-toggle-password-button", AxialTogglePasswordButton);
export { AxialTogglePasswordButton }