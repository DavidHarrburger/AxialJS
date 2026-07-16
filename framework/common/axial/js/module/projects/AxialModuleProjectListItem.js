"use strict";

import { AxialListItem } from "../../list/AxialListItem.js";

class AxialModuleProjectListItem extends AxialListItem
{
    /// vars
    /** @type { String } */
    #simulationDeletePath = "./api/simulations/delete";

    /** @type { String } */
    #simulationClonePath = "./api/simulations/clone";

    /// elements
    /** @type { HTMLElement } */
    #name;


    constructor()
    {
        super();
        this.template = "axial-module-project-list-item-template";
        this.popupId = "projectPopup";
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
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
    }
}

window.customElements.define("axial-module-project-list-item", AxialModuleProjectListItem);
export { AxialModuleProjectListItem }