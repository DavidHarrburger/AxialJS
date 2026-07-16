"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";

class AxialModuleProjectPopup extends AxialModulePopup
{
    /** @type { Object } */
    #project;

    /** @type { Object } */
    #simulation;


    constructor()
    {
        super();
        this.template = "axial-module-project-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _onDataChanged()
    {
        console.log("data in popup", this.data);
    }
}

window.customElements.define("axial-module-project-popup", AxialModuleProjectPopup);
export { AxialModuleProjectPopup }