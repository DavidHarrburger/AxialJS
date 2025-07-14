"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialWeekPlanning } from "../../date/AxialWeekPlanning.js";

class AxialAdminCompanyView extends AxialAdminViewBase
{
    /** @type { AxialServiceForm } */
    #companyForm;

    constructor()
    {
        super();
        this.template = "axial-admin-company-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#companyForm = this.shadowRoot.getElementById("companyForm");
    }

    _onViewEntered()
    {
        console.log("company view entered")
        const userUuid = window.AXIAL.userUuid;
        if( this.#companyForm )
        {
            const defaultUuid = "user_uuid," + userUuid;
            this.#companyForm.setAttribute("axial-defaults", defaultUuid);
        }
    }

    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "&f=model,company&f=user_uuid," + userUuid;
        return path;
    }

    _onGetResponse()
    {
        console.log( "companyView", this.getData);
        
        if( this.getData && this.getData.content && this.getData.content.length === 1 )
        {
            const formObject = this.getData.content[0];
            if( this.#companyForm )
            {
                this.#companyForm._fillForm(formObject);
            }
        }
    }

}
window.customElements.define("axial-admin-company-view", AxialAdminCompanyView);
export { AxialAdminCompanyView }