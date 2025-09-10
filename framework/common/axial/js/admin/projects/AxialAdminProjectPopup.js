"use strict";

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminProjectBuilder } from "./AxialAdminProjectBuilder.js";

class AxialAdminProjectPopup extends AxialAdminPopup
{
    /** @type { AxialAdminProjectBuilder } */
    #projectBuilder;

    constructor()
    {
        super();
        this.template = "axial-admin-project-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#projectBuilder = this.shadowRoot.getElementById("projectBuilder");
    }

    _onShowing()
    {
        if( this.#projectBuilder ) { this.#projectBuilder.init(); }
    }

}

window.customElements.define("axial-admin-project-popup", AxialAdminProjectPopup);
export { AxialAdminProjectPopup }