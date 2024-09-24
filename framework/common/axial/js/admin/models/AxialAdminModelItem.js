"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";

class AxialAdminModelItem extends AxialComponentBase
{
    /** @type { HTMLElement } */
    #name;


    constructor()
    {
        super();
        this.classList.add("axial_admin_model_item");
        this.template = "axial-admin-model-item-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#name = this.shadowRoot.getElementById("name");
    }

    _onDataChanged()
    {
        try
        {
            this.#name.innerHTML = this.data.name;
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-admin-model-item", AxialAdminModelItem);
export { AxialAdminModelItem }