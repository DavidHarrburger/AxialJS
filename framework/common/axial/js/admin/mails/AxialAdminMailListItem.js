"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialAdminMailListItem extends AxialAdminListItemBase
{
    /// elements
    /** @type { HTMLElement } */
    #subject;

    /** @type { HTMLElement } */
    #state;

    /** @type { HTMLElement } */
    #creation;
    
    /** @type { HTMLElement } */
    #dateSent;

    /** @type { HTMLElement } */
    #template;

    /** @type { HTMLElement } */
    #actions;

    /** @type { AxialButton } */
    #trashButton;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-mail-list-item-template";
    }

    _buildComponent()
    {
        this.#subject = this.shadowRoot.getElementById("subject");
        this.#state = this.shadowRoot.getElementById("state");
        this.#creation = this.shadowRoot.getElementById("creation");
        this.#dateSent = this.shadowRoot.getElementById("dateSent");
        this.#template = this.shadowRoot.getElementById("template");
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
            /*
            this.#name.innerHTML = this.data.username;
            this.#email.innerHTML = this.data.email;
            this.#role.innerHTML = this.data.role;
            */
        }
    }
}

window.customElements.define("axial-admin-mail-list-item", AxialAdminMailListItem);
export { AxialAdminMailListItem }