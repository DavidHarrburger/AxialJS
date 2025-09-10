"use strict";

import { AxialAdminListItem } from "../base/AxialAdminListItem.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialAdminEmployeeListItem extends AxialAdminListItem
{
    /// elements
    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #email;
    
    /** @type { HTMLElement } */
    #tel;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-employee-list-item-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#photo = this.shadowRoot.getElementById("photo");
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#tel = this.shadowRoot.getElementById("tel");

        if( this.data !== undefined )
        {
            this.#updateComponent();
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.componentBuilt === true )
        {
            this.#updateComponent();
        }
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            this.#photo.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.data.image_main)}')`;
            
            this.#name.innerHTML = this.data.first_name + " " + this.data.last_name.toUpperCase();
            this.#email.innerHTML = this.data.email;
            this.#tel.innerHTML = this.data.tel;
        }
    }
}

window.customElements.define("axial-admin-employee-list-item", AxialAdminEmployeeListItem);
export { AxialAdminEmployeeListItem }