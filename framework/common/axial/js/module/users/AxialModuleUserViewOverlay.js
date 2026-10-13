"use strict";

import { AxialModuleOverlay } from "../../overlay/AxialModuleOverlay.js";
import { AxialModuleUserCreatePopup } from "./AxialModuleUserCreatePopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleUserViewOverlay extends AxialModuleOverlay
{
    /// elements
    /** @type { AxialButton } */
    #addButton;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-module-user-view-overlay-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

    }

    #addHandler( event )
    {   
        this.hide();
        /** @type { AxialModuleUserCreatePopup} */
        const popup = AxialPopupManager.getPopupById("userCreatePopup");
        if( popup )
        {
            popup.data = undefined;
            popup.show();
        }
    }
}

window.customElements.define("axial-module-user-view-overlay", AxialModuleUserViewOverlay);
export { AxialModuleUserViewOverlay }