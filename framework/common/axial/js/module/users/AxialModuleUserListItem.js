"use strict";

import { AxialListItem } from "../../list/AxialListItem.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { FormatUtils } from "../../utils/FormatUtils.js";

import { AxialIconListButtonProject } from "../../list/buttons/AxialIconListButtonProject.js";
import { AxialModuleUserCreatePopup } from "./AxialModuleUserCreatePopup.js";

class AxialModuleUserListItem extends AxialListItem
{
    /// vars
    /** @type { Object } */
    #subscription;

    /** @type { Array } */
    #projectsData;

    /** @type { String } */
    #userUpdatePath = "./api/user/update";

    /// elements
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #email;

    /** @type { HTMLElement } */
    #tel;

    /** @type { HTMLElement } */
    #creation;

    /** @type { HTMLElement } */
    #projects;

    /** @type { AxialIconListButtonProject } */
    #projectButton;

    constructor()
    {
        super();
        this.template = "axial-module-user-list-item-template";
        this.#userUpdatePath = PathUtils.getPathFromRelative(this.#userUpdatePath);
        this.popupId = "userCreatePopup";
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#tel = this.shadowRoot.getElementById("tel");
        this.#creation = this.shadowRoot.getElementById("creation");

        this.#projects = this.shadowRoot.getElementById("projects");
        this.#projectButton = this.shadowRoot.getElementById("projectButton");

        super._buildComponent();
    }

    _updateComponent()
    {
        super._updateComponent();
        this.#name.innerHTML = this.data.first_name + " " + this.data.last_name;
        this.#email.innerHTML = this.data.email;
        this.#tel.innerHTML = FormatUtils.formatPhone( this.data.tel );
        this.#creation.innerHTML = DateUtils.format( new Date( this.data.creation_date ) );

        const projectsData = this.data.projects_data;
        if( projectsData && Array.isArray( projectsData ) === true )
        {
            this.#projectsData = projectsData;
            const l = projectsData.length;
            const projectLabel = l > 1 ? ( l + " projets" ) : ( l + " projet" );
            this.#projects.innerHTML = projectLabel;

            if( this.#projectButton )
            {
                this.#projectButton.username = this.data.first_name + " " + this.data.last_name;
                this.#projectButton.createdFor = this.data.uuid;
                this.#projectButton.projectsData = projectsData;
            }
        }
    }

    /**
     * 
     * @param { AxialModuleUserCreatePopup } popup 
     */
    _onItemEdit( popup )
    {
        super._onItemEdit( popup );
        popup.form.postPath = this.#userUpdatePath;
        popup.title = `Modifier '${this.data.first_name} ${this.data.last_name}'`;
    }

}

window.customElements.define("axial-module-user-list-item", AxialModuleUserListItem);
export { AxialModuleUserListItem }