"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminInternalProductPopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialServiceForm } */
    #internalProductForm;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-internal-product-popup-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialServiceForm }
     * @readonly
     */
    get form() { return this.#internalProductForm; }

    _buildComponent()
    {
        super._buildComponent();
        this.#internalProductForm = this.shadowRoot.getElementById("internalProductForm");
        if( this.#internalProductForm )
        {
            this.#internalProductForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Produit enregistré avec succès");
        this.hide();
    }
}

window.customElements.define("axial-admin-internal-product-popup", AxialAdminInternalProductPopup);
export { AxialAdminInternalProductPopup }