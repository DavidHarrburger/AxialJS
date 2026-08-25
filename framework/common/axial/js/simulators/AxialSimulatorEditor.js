"use strict";

import { AxialEditor } from "../editor/AxialEditor.js";

class AxialSimulatorEditor extends AxialEditor
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-simulator-editor", AxialSimulatorEditor);
export { AxialSimulatorEditor }