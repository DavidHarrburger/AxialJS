"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialAdminEventPopup } from "./AxialAdminEventPopup.js";
//import { AxialAdminClientListItem } from "./AxialAdminClientListItem.js";

class AxialAdminEventView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #eventList;

    /** @type { AxialButton } */
    #addEventButton;

    /** @type { AxialAdminEventPopup } */
    #eventPopup;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-event-view-template";
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#eventList = this.shadowRoot.getElementById("eventList");
        //this.#eventList.itemClass = AxialAdminClientListItem;

        this.#addEventButton = this.shadowRoot.getElementById("addEventButton");
        this.#addEventButton.addEventListener("click", this.#boundAddButtonHandler);
    }

    _prepareGetData()
    {
        /*
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "&f=model,client&f=user_uuid," + userUuid;
        return path;
        */
    }

    _onGetResponse()
    {
    }

    #addButtonHandler( event )
    {
        this.#eventPopup = AxialPopupManager.getPopupById("eventPopup");
        if( this.#eventPopup )
        {
            //const userUuid = window.AXIAL.userUuid;
            //const defaultUuid = "user_uuid," + userUuid;
            //this.#clientPopup.form.setAttribute("axial-defaults", defaultUuid);
            this.#eventPopup.title = "Créer un évènement";
            this.#eventPopup.show();
        }
    }

}
window.customElements.define("axial-admin-event-view", AxialAdminEventView);
export { AxialAdminEventView }