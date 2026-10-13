"use strict"

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialBookingAgenda } from "../../booking/AxialBookingAgenda.js";
import { AxialModuleBookingParamPopup } from "./AxialModuleBookingParamPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleBookingView extends AxialModuleView
{
    /// vars
    /** @type { String } */
    #bookingParamPopupId = "bookingParamPopup";

    /// elements
    /** @type { AxialButton } */
    #paramButton;

    /** @type { AxialModuleBookingParamPopup } */
    #bookingParamPopup;

    /** @type { AxialBookingAgenda } */
    #bookingAgenda;
    
    /// events
    /** @type { Function } */
    #boundParamClickHandler;

    constructor()
    {
        super();
        this.template = "axial-module-booking-view-template";
        this.#boundParamClickHandler = this.#paramClickHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#paramButton = this.shadowRoot.getElementById("paramButton");
        if( this.#paramButton )
        {
            this.#paramButton.addEventListener("click", this.#boundParamClickHandler);
        }

        this.#bookingAgenda = this.shadowRoot.getElementById("bookingAgenda");
    }

    #paramClickHandler( event )
    {
        this.#bookingParamPopup = AxialPopupManager.getPopupById( this.#bookingParamPopupId );
        if( this.#bookingParamPopup )
        {
            this.#bookingParamPopup.show();
        }
    }
}
window.customElements.define("axial-module-booking-view", AxialModuleBookingView);
export { AxialModuleBookingView }
