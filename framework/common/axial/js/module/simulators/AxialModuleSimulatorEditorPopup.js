"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialSimulatorEditor } from "../../simulators/AxialSimulatorEditor.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleSimulatorEditorPopup extends AxialModulePopup
{
    /** @type { AxialSimulatorEditor } */
    #editor

    constructor()
    {
        super();
        this.template = "axial-module-simulator-editor-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#editor = this.shadowRoot.getElementById("editor");
    }

    _onDataChanged()
    {
        super._onDataChanged();
    }

}

window.customElements.define("axial-module-simulator-editor-popup", AxialModuleSimulatorEditorPopup);
export { AxialModuleSimulatorEditorPopup }