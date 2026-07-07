"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminUserPopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialServiceForm } */
    #form;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-user-popup-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialServiceForm }
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

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#form )
        {
            if( this.data === undefined )
            {
                this.title = "Ajouter un utilisateur";
                this.#form.clearForm();
            }
            else
            {
                this.#form._fillForm( this.data );
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Utilisateur enregistré avec succès");
        this.hide();
    }
}

window.customElements.define("axial-admin-user-popup", AxialAdminUserPopup);
export { AxialAdminUserPopup }