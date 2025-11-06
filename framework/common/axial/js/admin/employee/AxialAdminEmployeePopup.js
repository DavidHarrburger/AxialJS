"use strict";

import { AxialServiceForm } from "../../forms/AxialServiceForm.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminEmployeePopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialServiceForm } */
    #employeeForm;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-employee-popup-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialServiceForm }
     * @readonly
     */
    get form() { return this.#employeeForm; }

    _buildComponent()
    {
        super._buildComponent();
        this.#employeeForm = this.shadowRoot.getElementById("employeeForm");
        if( this.#employeeForm )
        {
            this.#employeeForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#employeeForm )
        {
            if( this.data === undefined )
            {
                this.title = "Ajouter un employé";
                const userUuid = window.AXIAL.userUuid;
                const defaultUuid = "user_uuid," + userUuid;
                this.#employeeForm.setAttribute("axial-defaults", defaultUuid);
                this.#employeeForm.clearForm();
            }
            else
            {
                this.#employeeForm._fillForm( this.data );
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Employé enregistré avec succès");
        this.hide();
    }
}

window.customElements.define("axial-admin-employee-popup", AxialAdminEmployeePopup);
export { AxialAdminEmployeePopup }