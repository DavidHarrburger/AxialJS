"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialEditorBase extends AxialComponentBase
{
    constructor()
    {
        super();
        this.setAttribute("contenteditable", true);
        this.classList.add("axial_editor_base");
    }
}

window.customElements.define("axial-editor-base", AxialEditorBase);
export { AxialEditorBase }