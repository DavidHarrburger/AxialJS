"use strict"

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminMailList } from "./AxialAdminMailList.js";

class AxialAdminMailView extends AxialAdminViewBase
{

    /** @type { AxialAdminMailList } */
    #mailList;

    constructor()
    {
        super();
        this.template = "axial-admin-mail-view-template";
    }

    _onViewEntered()
    {
        if( this.#mailList ) { this.#mailList.getAllMails(); }
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#mailList = this.shadowRoot.getElementById("mailList");
    }


}
window.customElements.define("axial-admin-mail-view", AxialAdminMailView);
export { AxialAdminMailView }