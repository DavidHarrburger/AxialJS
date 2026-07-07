"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialWeekPlanning } from "../../date/AxialWeekPlanning.js";

class AxialAdminCompanyView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialServiceForm } */
    #companyForm;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-company-view-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#companyForm = this.shadowRoot.getElementById("companyForm");
        if( this.#companyForm )
        {
            this.#companyForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
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
        const path = this.getPath + "?c=companies&m=company&f=model,company&f=user_uuid," + userUuid;
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

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Informations enregistrées avec succès");
        if( this.#companyForm )
        {
            this.#companyForm.enableForm();
        }
    }

}
window.customElements.define("axial-admin-company-view", AxialAdminCompanyView);
export { AxialAdminCompanyView }