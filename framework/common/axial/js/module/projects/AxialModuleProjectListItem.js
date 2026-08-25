"use strict";

import { AxialListItem } from "../../list/AxialListItem.js";
import { AxialIconButton } from "../../button/AxialIconButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleProjectListItem extends AxialListItem
{
    /// vars
    /** @type { String } */
    #simulationDeletePath = "./api/simulation/delete";

    /** @type { String } */
    #simulationClonePath = "./api/simulation/clone";

    /// elements
    /** @type { HTMLElement } */
    #name;

    /** @type { AxialIconButton } */
    #visualizeButton;

    /// events
    /** @type { Function } */
    #boundVisualizeHandler;

    constructor()
    {
        super();
        this.template = "axial-module-project-list-item-template";
        this.popupId = "projectPopup";
        this.#boundVisualizeHandler = this.#visualizeHandler.bind(this);
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
        this.#visualizeButton = this.shadowRoot.getElementById("visualizeButton");
        if( this.#visualizeButton )
        {
            this.#visualizeButton.addEventListener("click", this.#boundVisualizeHandler);
        }
        super._buildComponent();
    }

    _updateComponent()
    {
        super._updateComponent();
        this.#name.innerHTML = this.data?.simulation_name;
        
        if( this.deleteButton )
        {
            this.deleteButton.deletionPath = this.#simulationDeletePath;
            this.deleteButton.collection = "projects";
            this.deleteButton._id = this.data._id;
        }

        if( this.archiveButton )
        {
            this.archiveButton.collection = "projects";
            this.archiveButton._id = this.data._id;
        }

        if( this.cloneButton )
        {
            this.cloneButton.operationPath = this.#simulationClonePath;
            this.cloneButton.collection = "projects";
            this.cloneButton._id = this.data._id;
        }

        console.log("project item", this.data.user_uuid )
        if( this.data.user_uuid != window.AXIAL.userUuid )
        {
            if( this.archiveButton) { this.archiveButton.remove(); }
            if( this.deleteButton) { this.deleteButton.remove(); }
            if( this.editButton) { this.editButton.remove(); }
        }
        else
        {
            if( this.lockButton) { this.lockButton.remove(); }
        }
    }

    #visualizeHandler( event )
    {
        const popup = AxialPopupManager.getPopupById("quotePopup");
        popup.data = this.data;
        popup.show();
    }
}

window.customElements.define("axial-module-project-list-item", AxialModuleProjectListItem);
export { AxialModuleProjectListItem }