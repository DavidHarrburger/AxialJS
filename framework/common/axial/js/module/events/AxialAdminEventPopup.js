"use strict";

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminEventBuilder } from "./AxialAdminEventBuilder.js";

class AxialAdminEventPopup extends AxialAdminPopup
{
    /** @type { AxialAdminEventBuilder } */
    #eventBuilder;

    constructor()
    {
        super();
        this.template = "axial-admin-event-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#eventBuilder = this.shadowRoot.getElementById("eventBuilder");
    }

    _onShowing()
    {
        if( this.#eventBuilder ) { this.#eventBuilder.init(); }
    }

}

window.customElements.define("axial-admin-event-popup", AxialAdminEventPopup);
export { AxialAdminEventPopup }