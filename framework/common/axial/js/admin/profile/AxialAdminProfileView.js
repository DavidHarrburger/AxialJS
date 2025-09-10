"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";

class AxialAdminProfileView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialServiceForm } */
    #profileForm;

    /// events
    /** @type { Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-profile-view-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#profileForm = this.shadowRoot.getElementById("profileForm");
        if( this.#profileForm )
        {
            this.#profileForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "&f=uuid," + userUuid;
        console.log("profileview path  > ", path);
        return path;
    }

    _onGetResponse()
    {
        const formObject = this.getData.content[0];
        if( this.#profileForm )
        {
            this.#profileForm._fillForm(formObject);
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Les modifications de votre profil on été enregistrées avec succès");
    }

}
window.customElements.define("axial-admin-profile-view", AxialAdminProfileView);
export { AxialAdminProfileView }