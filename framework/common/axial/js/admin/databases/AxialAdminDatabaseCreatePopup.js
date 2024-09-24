"use strict"

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminDatabaseCreateForm } from "./AxialAdminDatabaseCreateForm.js";

class AxialAdminDatabaseCreatePopup extends AxialAdminPopup
{
    /** @type { AxialAdminDatabaseCreateForm } */
    #createForm;

    constructor()
    {
        super();
        this.template = "axial-admin-database-create-popup-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#createForm = this.shadowRoot.getElementById("databaseCreateForm");
    }

    _onShowing()
    {
        if( this.#createForm )
        {
            this.#createForm.initialize();
        }
    }

}

window.customElements.define("axial-admin-database-create-popup", AxialAdminDatabaseCreatePopup);
export { AxialAdminDatabaseCreatePopup }