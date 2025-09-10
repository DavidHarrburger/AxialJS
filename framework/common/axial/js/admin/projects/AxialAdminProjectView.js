"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialAdminProjectPopup } from "./AxialAdminProjectPopup.js";
//import { AxialAdminClientListItem } from "./AxialAdminClientListItem.js";

class AxialAdminProjectView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #projectList;

    /** @type { AxialButton } */
    #addProjectButton;

    /** @type { AxialAdminEventPopup } */
    #projectPopup;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-project-view-template";
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#projectList = this.shadowRoot.getElementById("projectList");
        //this.#eventList.itemClass = AxialAdminClientListItem;

        this.#addProjectButton = this.shadowRoot.getElementById("addProjectButton");
        this.#addProjectButton.addEventListener("click", this.#boundAddButtonHandler);
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
        this.#projectPopup = AxialPopupManager.getPopupById("projectPopup");
        if( this.#projectPopup )
        {
            //const userUuid = window.AXIAL.userUuid;
            //const defaultUuid = "user_uuid," + userUuid;
            //this.#clientPopup.form.setAttribute("axial-defaults", defaultUuid);
            this.#projectPopup.title = "Créer un nouveau projet";
            this.#projectPopup.show();
        }
    }

}
window.customElements.define("axial-admin-project-view", AxialAdminProjectView);
export { AxialAdminProjectView }