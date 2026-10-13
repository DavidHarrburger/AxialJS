"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialBookingAgenda } from "../../booking/AxialBookingAgenda.js";

class AxialModuleBookingPopup extends AxialModulePopup
{
    /** @type { AxialBookingAgenda } */
    #bookingAgenda;

    constructor()
    {
        super();

        this.classList.add("axial_module_booking_popup");
        this.template = "axial-module-booking-popup-template";
        this.title = "Prendre un RDV";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#bookingAgenda = this.shadowRoot.getElementById("bookingAgenda");
        
    }

    _onShowing()
    {
        this.#bookingAgenda.refresh();
    }
}

window.customElements.define("axial-module-booking-popup", AxialModuleBookingPopup);
export { AxialModuleBookingPopup }