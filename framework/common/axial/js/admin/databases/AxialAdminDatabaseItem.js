"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";

class AxialAdminDatabaseItem extends AxialComponentBase
{
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #size;

    constructor()
    {
        super();
        this.classList.add("axial_admin_database_item");
        this.template = "axial-admin-database-item-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#name = this.shadowRoot.getElementById("name");
        this.#size = this.shadowRoot.getElementById("size");
    }

    _onDataChanged()
    {
        try
        {
            this.#name.innerHTML = this.data.name;
            this.#size.innerHTML = this.data.sizeOnDisk + " b";
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-admin-database-item", AxialAdminDatabaseItem);
export { AxialAdminDatabaseItem }