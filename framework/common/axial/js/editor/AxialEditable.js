"use strict";

import { AxialEditableBase } from "./AxialEditableBase.js";

class AxialEditable extends AxialEditableBase
{
    constructor()
    {
        super();
        this.classList.add("axial_editable");
        this.template = "axial-editable-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.content = this.shadowRoot.getElementById("content");
    }
}

window.customElements.define("axial-editable", AxialEditable);
export { AxialEditable }