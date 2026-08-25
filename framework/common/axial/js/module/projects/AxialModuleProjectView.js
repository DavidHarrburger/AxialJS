"use strict";

import { AxialButton } from "../../button/AxialButton.js";
import { AxialList } from "../../list/AxialList.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialModuleCreateProjectOverlay } from "./AxialModuleCreateProjectOverlay.js";
import { AxialModuleProjectListItem } from "./AxialModuleProjectListItem.js";
import { AxialModuleProjectPopup } from "./AxialModuleProjectPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleProjectView extends AxialModuleView
{
    /// vars
    /** @type { Array } */
    #projects;

    /** @type { String } */
    #createProjectOverlayId = "createProjectOverlay";

    /** @type { String } */
    #projectPopupId = "projectPopup";

    /** @type { String } */
    #apiProjectGetPath = "./api/projects/get";

    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialList } */
    #list;

    /** @type { AxialModuleCreateProjectOverlay } */
    #createProjectOverlay;

    /** @type { AxialModuleProjectPopup } */
    #projectPopup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundListChangedHandler;

    /** @type { Function } */
    #boundProjectCreatedHandler;

    /** @type { Function } */
    #boundProjectErrorHandler;

    /// axial
    /** @type { Function } */
    #boundAxialUserReadyHandler;

    constructor()
    {
        super();
        this.template = "axial-module-project-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);
        this.#boundProjectCreatedHandler = this.#projectCreatedHandler.bind(this);
        this.#boundProjectErrorHandler = this.#projectErrorHandler.bind(this);

        this.#boundAxialUserReadyHandler = this.#axialUserReadyHandler.bind(this);

        window.addEventListener( "axialUserReady", this.#boundAxialUserReadyHandler );

        this.#apiProjectGetPath = PathUtils.getPathFromRelative( this.#apiProjectGetPath );
        this.getPath = this.#apiProjectGetPath;
    }

     #axialUserReadyHandler( event )
    {
        //console.log("axialUserReadyHandler in project view");
        const user = event.detail.user;
        if( user.role === "user" )
        {
            this.#createProjectOverlay.createdFor = user.uuid;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#searchInput = this.shadowRoot.getElementById("searchInput");
        
        this.#list = this.shadowRoot.getElementById("list");
        this.#list.itemClass = AxialModuleProjectListItem;
        this.#list.searchInput = this.#searchInput;
        this.#list.searchDataKeys.add("project_name");
        this.#list.addEventListener("listChanged", this.#boundListChangedHandler);

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

        this.#createProjectOverlay = document.getElementById( this.#createProjectOverlayId );
        if( this.#createProjectOverlay )
        {
            this.#createProjectOverlay.addEventListener("projectCreated", this.#boundProjectCreatedHandler);
            this.#createProjectOverlay.addEventListener("projectError", this.#boundProjectErrorHandler);
        }
    }

    _prepareGetData()
    {
        const uuid = window.AXIAL.userObject.uuid;
        if( uuid )
        {
            this.getPath = this.#apiProjectGetPath + "?cf=" + uuid;
        }
        return this.getPath;
    }

    _onGetResponse()
    {
        this.#projects = this.getData.content === null ? [] : this.getData.content;

        if( this.#projects.length === 0 ) { console.warn("display no project screen"); }
        else
        {
            this.#list.empty();
            for( const p of this.#projects )
            {
                const simulations = p?.simulations_data;
                // check one
                for( const sim of simulations )
                {
                    const item = this.#list.addItem();
                    item.data = sim;
                }
            }
        }
    }

    #addHandler( event )
    {
        if( this.#createProjectOverlay )
        {
            this.#createProjectOverlay.show();
        }
    }

    #listChangedHandler( event )
    {
        this.loadGetData();
    }

    #projectCreatedHandler( event )
    {
        console.log("project created");
        console.log( event );
        //this.#updateAndOpen( event.detail.projectId );
        const projectCreated = event.detail.project;
        const projectId = projectCreated._id;
        this.#updateAndOpen( projectId );
    }

    #projectErrorHandler( event )
    {
        console.log("project error");
        //this.#updateAndOpen( event.detail.projectId );
    }

    async #updateAndOpen( projectId )
    {
        console.log("should load");
        try
        {
            await this.loadGetData();
            if( this.#createProjectOverlay.openOnCreation === true )
            {
                for( const project of this.#projects )
                {
                    if( project._id === projectId )
                    {
                        console.log( project.simulations_data );
                        const simulationData = project.simulations_data[0];
                        this.#projectPopup = AxialPopupManager.getPopupById(this.#projectPopupId);
                        this.#projectPopup.data = simulationData;
                        this.#projectPopup.show();
                    }
                }
            }
        }
        catch(err)
        {

        }
        
    }
}

window.customElements.define("axial-module-project-view", AxialModuleProjectView);
export { AxialModuleProjectView }