"use strict"

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminModelForm } from "./AxialAdminModelForm.js";


class AxialAdminModelPopup extends AxialAdminPopup
{
    /** @type { AxialAdminModelForm } */
    #modelForm;

    constructor()
    {
        super();
        this.classList.add("axial_admin_model_popup");
        this.animation = "translate_up";
        this.template = "axial-admin-model-popup-template";
    }

    /** @readonly */
    get modelForm() { return this.#modelForm; }

    connectedCallback()
    {
        super.connectedCallback();
        this.#modelForm = this.shadowRoot.getElementById("modelForm");
    }
}

window.customElements.define("axial-admin-model-popup", AxialAdminModelPopup);
export { AxialAdminModelPopup }