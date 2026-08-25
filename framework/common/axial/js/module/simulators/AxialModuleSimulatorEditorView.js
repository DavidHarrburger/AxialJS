"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialModuleSimulatorEditorPopup } from "./AxialModuleSimulatorEditorPopup.js";

class AxialModuleSimulatorEditorView extends AxialModuleView
{
    /// vars
    /** @type { String } */
    #simulatorEditorPopupId = "simulatorEditorPopup";

    /// elements
    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialModuleSimulatorEditorPopup } */
    #simulatorEditorPopup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-module-simulator-editor-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

        this.#simulatorEditorPopup = document.getElementById( this.#simulatorEditorPopupId );
    }

    #addHandler( event )
    {
        if( this.#simulatorEditorPopup )
        {
            this.#simulatorEditorPopup.data = undefined;
            this.#simulatorEditorPopup.show();
        }
    }
}

window.customElements.define("axial-module-simulator-editor-view", AxialModuleSimulatorEditorView);
export { AxialModuleSimulatorEditorView }