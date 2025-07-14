"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminUserListItem extends AxialAdminListItemBase
{
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #email;

    /** @type { HTMLElement } */
    #role;
    
    /** @type { HTMLElement } */
    #account;

    /** @type { HTMLElement } */
    #newsletter;

    /** @type { HTMLElement } */
    #creation;

    constructor()
    {
        super();
        this.classList.add("axial_admin_user_list_item");
        this.template = "axial-admin-user-list-item-template";
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#role = this.shadowRoot.getElementById("role");
        this.#account = this.shadowRoot.getElementById("account");
        this.#newsletter = this.shadowRoot.getElementById("newsletter");
        this.#creation = this.shadowRoot.getElementById("creation");

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
            this.#name.innerHTML = this.data.username;
            this.#email.innerHTML = this.data.email;
            this.#role.innerHTML = this.data.role;
        }
    }
}

window.customElements.define("axial-admin-user-list-item", AxialAdminUserListItem);
export { AxialAdminUserListItem }