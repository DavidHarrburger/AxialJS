"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminClientPopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialServiceForm } */
    #clientForm;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-client-popup-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialServiceForm }
     * @readonly
     */
    get form() { return this.#clientForm; }

    _buildComponent()
    {
        super._buildComponent();
        this.#clientForm = this.shadowRoot.getElementById("clientForm");
        if( this.#clientForm )
        {
            this.#clientForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Client enregistré avec succès");
        this.hide();
    }
}

window.customElements.define("axial-admin-client-popup", AxialAdminClientPopup);
export { AxialAdminClientPopup }