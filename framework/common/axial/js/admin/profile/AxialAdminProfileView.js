"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";

class AxialAdminProfileView extends AxialAdminViewBase
{
    /** @type { AxialServiceForm } */
    #profileForm;

    constructor()
    {
        super();
        this.template = "axial-admin-profile-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#profileForm = this.shadowRoot.getElementById("profileForm");
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

}
window.customElements.define("axial-admin-profile-view", AxialAdminProfileView);
export { AxialAdminProfileView }