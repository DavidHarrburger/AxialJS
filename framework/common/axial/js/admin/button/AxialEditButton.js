"use strict";

import { AxialButton } from "../../button/AxialButton.js";

class AxialEditButton extends AxialButton
{
    constructor()
    {
        super();
    }
}
window.customElements.define("axial-edit-button", AxialEditButton);
export { AxialEditButton }