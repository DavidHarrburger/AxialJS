"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";

class AxialAdminUserItem extends AxialComponentBase
{
    /** @type { HTMLElement } */
    #color;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #role;

    /** @type { HTMLElement } */
    #uuid;

    constructor()
    {
        super();
        this.classList.add("axial_admin_user_item");
        this.template = "axial-admin-user-item-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#color = this.shadowRoot.getElementById("color");
        this.#name = this.shadowRoot.getElementById("name");
        this.#role = this.shadowRoot.getElementById("role");
        this.#uuid = this.shadowRoot.getElementById("uuid");
    }

    _onDataChanged()
    {
        try
        {
            this.#color.style.backgroundColor = this.data.color;
            this.#name.innerHTML = this.data.username;
            this.#role.innerHTML = this.data.role;
            this.#uuid.innerHTML = this.data.uuid;
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-admin-user-item", AxialAdminUserItem);
export { AxialAdminUserItem }