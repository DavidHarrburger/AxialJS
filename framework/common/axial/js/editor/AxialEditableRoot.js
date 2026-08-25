"use strict";

import { AxialEditableBase } from "./AxialEditableBase.js";

class AxialEditableRoot extends AxialEditableBase
{
    constructor()
    {
        super();
        this.classList.add("axial_editable_root");
        this.template = "axial-editable-root-template";
        this.editableName = "root";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.content = this.shadowRoot.getElementById("content");
    }
    
}

window.customElements.define("axial-editable-root", AxialEditableRoot);
export { AxialEditableRoot }