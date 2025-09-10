"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialAdminClientPopup } from "./AxialAdminClientPopup.js";
import { AxialAdminClientListItem } from "./AxialAdminClientListItem.js";

class AxialAdminClientView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #clientList;

    /** @type { AxialButton } */
    #addClientButton;

    /** @type { AxialAdminClientPopup } */
    #clientPopup;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-client-view-template";
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#clientList = this.shadowRoot.getElementById("clientList");
        this.#clientList.itemClass = AxialAdminClientListItem;

        this.#addClientButton = this.shadowRoot.getElementById("addClientButton");
        this.#addClientButton.addEventListener("click", this.#boundAddButtonHandler);
    }

    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "&f=model,client&f=user_uuid," + userUuid;
        return path;
    }

    _onGetResponse()
    {
        const clients = this.getData.content;
        console.log("client view data ", clients);
        if( this.#clientList )
        {
            this.#clientList.data = clients;
        }
    }

    #addButtonHandler( event )
    {
        this.#clientPopup = AxialPopupManager.getPopupById("clientPopup");
        if( this.#clientPopup )
        {
            const userUuid = window.AXIAL.userUuid;
            const defaultUuid = "user_uuid," + userUuid;
            this.#clientPopup.form.setAttribute("axial-defaults", defaultUuid);
            this.#clientPopup.title = "Ajouter un client";
            this.#clientPopup.show();
        }
    }

}
window.customElements.define("axial-admin-client-view", AxialAdminClientView);
export { AxialAdminClientView }