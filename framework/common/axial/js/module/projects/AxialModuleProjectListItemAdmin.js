"use strict";

import { AxialIconButton } from "../../button/AxialIconButton.js";
import { AxialModuleProjectListItem } from "./AxialModuleProjectListItem.js";
import { AxialModuleSimulatorQuotePopup } from "../simulators/AxialModuleSimulatorQuotePopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleProjectListItemAdmin extends AxialModuleProjectListItem
{
    /** @type { AxialIconButton } */
    #visualizeButton;

    /** @type { Function } */
    #boundVisualizeHandler;

    constructor()
    {
        super();
        this.template = "axial-module-project-list-item-admin-template";
        this.#boundVisualizeHandler = this.#visualizeHandler.bind(this);
    }

    _buildComponent()
    {
        this.#visualizeButton = this.shadowRoot.getElementById("visualizeButton");
        if( this.#visualizeButton )
        {
            this.#visualizeButton.addEventListener("click", this.#boundVisualizeHandler);
        }
        super._buildComponent();
    }

    _updateComponent()
    {
        super._updateComponent();
    }

    #visualizeHandler( event )
    {
        const popup = AxialPopupManager.getPopupById("quotePopup");
        popup.data = this.data;
        popup.show();
    }
}

window.customElements.define("axial-module-project-list-item-admin", AxialModuleProjectListItemAdmin);
export { AxialModuleProjectListItemAdmin }