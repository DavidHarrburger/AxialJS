"use strict";

import { AxialList } from "../../list/AxialList.js";
import { AxialListDivider } from "../../list/AxialListDivider.js";
import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialModuleProjectListItem } from "./AxialModuleProjectListItem.js";
import { AxialModuleProjectListItemAdmin } from "./AxialModuleProjectListItemAdmin.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";

class AxialModuleSelectProjectPopup extends AxialModulePopup
{
    ///
    /** @type { String } */
    #createdFor;
    
    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { AxialList } */
    #list;

    /** @type { String } */
    #apiProjectGetPath = "./api/projects/get";

    /// events
    /** @type { Function } */
    #boundListChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_module_select_project_popup");
        this.template = "axial-module-select-project-popup-template";
        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;
        //this.isModal = false;

        this.#apiProjectGetPath = PathUtils.getPathFromRelative( this.#apiProjectGetPath );

        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);
    }

    get createdFor() { return this.#createdFor; }
    set createdFor( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("String required here");
        }
        this.#createdFor = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#searchInput = this.shadowRoot.getElementById("searchInput");

        this.#list = this.shadowRoot.getElementById("list");
        this.#list.itemClass = AxialModuleProjectListItemAdmin;
        this.#list.searchInput = this.#searchInput;
        this.#list.searchDataKeys.add("project_name");

        this.#list.addEventListener("listChanged", this.#boundListChangedHandler);
    }

    #listChangedHandler(event)
    {
        console.log("list changed in select project popup");
        this.#getProjects();
    }

    async #getProjects()
    {
        try
        {
            const query = "cf=" + this.#createdFor;
            const response = await FetchUtils.GET( this.#apiProjectGetPath, query );
            console.log("FINALLY WE GOT IT")
            console.log(response);
            this.data = response.content;

        }
        catch(err)
        {
            console.log(err);
        }
    }

    _onDataChanged()
    {
        console.log(this.data);

        this.#list.empty();

        for( const project of this.data )
        {
            const simulations = project.simulations_data;
            for( const sim of simulations )
            {
                const item = this.#list.addItem();
                item.data = sim;
            }
        }
        
    }

}

window.customElements.define("axial-module-select-project-popup", AxialModuleSelectProjectPopup);
export { AxialModuleSelectProjectPopup }