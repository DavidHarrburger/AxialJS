"use strict";

import { AxialModuleBookingParamForm } from "./AxialModuleBookingParamForm.js"
import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleBookingParamPopup extends AxialModulePopup
{
    /// elements
    /** @type { AxialModuleBookingParamForm } */
    #form;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();

        this.classList.add("axial_module_booking_param_popup");
        this.template = "axial-module-booking-param-popup-template";

        this.title = "Paramètres des RDV";
        
        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;

        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialModuleProductForm }
     * @readonly
     */
    get form() { return this.#form; }

    _buildComponent()
    {
        super._buildComponent();
        this.#form = this.shadowRoot.getElementById("form");
        if( this.#form )
        {
            this.#form.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    _onShowing()
    {
        if( this.#form )
        {
            this.#form.loadGetData();
        }
    }


    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        if( event.detail.method == "post" )
        {
            window.AXIAL.notify("Paramètres enregistrés avec succès");
            this.hide();
        }
    }
}

window.customElements.define("axial-module-booking-param-popup", AxialModuleBookingParamPopup);
export { AxialModuleBookingParamPopup }