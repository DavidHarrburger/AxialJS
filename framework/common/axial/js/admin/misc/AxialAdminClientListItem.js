"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialAdminClientListItem extends AxialAdminListItemBase
{
    /// elements
    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #clientType;

    /** @type { HTMLElement } */
    #email;
    
    /** @type { HTMLElement } */
    #tel;

    /** @type { HTMLElement } */
    #actions;


    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-client-list-item-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#photo = this.shadowRoot.getElementById("photo");
        this.#clientType = this.shadowRoot.getElementById("clientType");
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#tel = this.shadowRoot.getElementById("tel");
        this.#actions = this.shadowRoot.getElementById("actions");

        this.#updateComponent();
    }

    _onDataChanged()
    {
        this.#updateComponent();
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            if( this.data.image_main !== "" )
            {
                this.#photo.src = PathUtils.getPathFromRelative(this.data.image_main);
            }
            
            const clientType = this.data.client_type;
            this.#clientType.innerHTML = clientType;

            if( clientType === "particulier" )
            {
                this.#name.innerHTML = this.data.first_name + " " + this.data.last_name.toUpperCase();
            }
            else
            {
                this.#name.innerHTML = this.data.client_company_name;
            }
            
            this.#email.innerHTML = this.data.email;
            this.#tel.innerHTML = this.data.tel;
        }
    }
}

window.customElements.define("axial-admin-client-list-item", AxialAdminClientListItem);
export { AxialAdminClientListItem }