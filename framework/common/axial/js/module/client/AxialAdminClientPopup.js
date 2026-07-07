"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialComponentBase } from "../../core/AxialComponentBase.js";

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

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#clientForm )
        {
            if( this.data === undefined )
            {
                this.title = "Ajouter un client";
                const userUuid = window.AXIAL.userUuid;
                const defaultUuid = "user_uuid," + userUuid;
                this.#clientForm.setAttribute("axial-defaults", defaultUuid);
                this.#clientForm.clearForm();
            }
            else
            {
                this.title = "Modifier le client";
                this.#clientForm._fillForm( this.data );
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        console.log(event);
        window.AXIAL.notify("Client enregistré avec succès");
        if( this.caller !== undefined && this.caller instanceof AxialComponentBase === true ) // not the right place to check but works
        {
            const caller = this.caller;
            caller.data = event.detail.data.content.insertedId;
            this.caller = undefined;
        }
        this.hide();
    }
}

window.customElements.define("axial-admin-client-popup", AxialAdminClientPopup);
export { AxialAdminClientPopup }