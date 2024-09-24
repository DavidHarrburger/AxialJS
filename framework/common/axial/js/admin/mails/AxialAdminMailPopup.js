"use strict"

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminMailViewer } from "./AxialAdminMailViewer.js"


class AxialAdminMailPopup extends AxialAdminPopup
{
    /** @type { AxialAdminMailViewer } */
    #mailViewer;

    constructor()
    {
        super();
        this.classList.add("axial_admin_mail_popup");
        this.animation = "translate_up";
        this.template = "axial-admin-mail-popup-template";
    }

    /** @readonly */
    get mailViewer() { return this.#mailViewer; }

    connectedCallback()
    {
        super.connectedCallback();
        this.#mailViewer = this.shadowRoot.getElementById("mailViewer");
    }
}

window.customElements.define("axial-admin-mail-popup", AxialAdminMailPopup);
export { AxialAdminMailPopup }