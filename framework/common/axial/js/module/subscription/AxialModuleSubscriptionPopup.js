"use strict";

import { AxialModuleSubscriptionForm } from "./AxialModuleSubscriptionForm.js";
import { AxialModulePopup } from "../../popup/AxialModulePopup.js";

class AxialModuleSubscriptionPopup extends AxialModulePopup
{
    /// elements
    /** @type { AxialModuleSubscriptionForm } */
    #form;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        
        this.classList.add("axial_module_subscription_popup");
        this.template = "axial-module-subscription-popup-template";

        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;
        
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);

        this.title = "Créer un abonnement";
    }

    /**
     * @type { AxialModuleSubscriptionForm }
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

window.customElements.define("axial-module-subscription-popup", AxialModuleSubscriptionPopup);
export { AxialModuleSubscriptionPopup }