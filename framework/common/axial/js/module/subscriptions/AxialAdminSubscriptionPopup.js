"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminSubscriptionPopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialServiceForm } */
    #subscriptionForm;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-subscription-popup-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialServiceForm }
     * @readonly
     */
    get form() { return this.#subscriptionForm; }

    _buildComponent()
    {
        super._buildComponent();
        this.#subscriptionForm = this.shadowRoot.getElementById("subscriptionForm");
        if( this.#subscriptionForm )
        {
            this.#subscriptionForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Abonnement créé avec succès");
        this.hide();
    }
}

window.customElements.define("axial-admin-subscription-popup", AxialAdminSubscriptionPopup);
export { AxialAdminSubscriptionPopup }