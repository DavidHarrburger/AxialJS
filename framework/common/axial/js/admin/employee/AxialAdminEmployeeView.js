"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminEmployeePopup } from "./AxialAdminEmployeePopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialAdminEmployeeListItem } from "./AxialAdminEmployeeListItem.js";

class AxialAdminEmployeeView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #employeeList;

    /** @type { AxialButton } */
    #addEmployeeButton;

    /** @type { AxialAdminEmployeePopup } */
    #employeePopup;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-employee-view-template";
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#employeeList = this.shadowRoot.getElementById("employeeList");
        this.#employeeList.itemClass = AxialAdminEmployeeListItem;

        this.#addEmployeeButton = this.shadowRoot.getElementById("addEmployeeButton");
        this.#addEmployeeButton.addEventListener("click", this.#boundAddButtonHandler);
    }

    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "?c=employees&m=employee&f=model,employee&f=user_uuid," + userUuid;
        return path;
    }

    _onGetResponse()
    {
        const employees = this.getData.content;
        console.log("employee view data ", employees);
        if( this.#employeeList )
        {
            this.#employeeList.data = employees;
        }
    }

    #addButtonHandler( event )
    {
        this.#employeePopup = AxialPopupManager.getPopupById("employeePopup");
        if( this.#employeePopup )
        {
            this.#employeePopup.data = undefined;
            this.#employeePopup.show();
        }
    }

}
window.customElements.define("axial-admin-employee-view", AxialAdminEmployeeView);
export { AxialAdminEmployeeView }