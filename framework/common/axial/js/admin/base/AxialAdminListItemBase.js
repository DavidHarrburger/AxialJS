"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";

class AxialAdminListItemBase extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
    }
}

window.customElements.define("axial-admin-list-item-base", AxialAdminListItemBase);
export { AxialAdminListItemBase }