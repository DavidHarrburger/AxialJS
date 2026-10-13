"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialListItemBase extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        //this.classList.add("axial_list_item");
    }
}

window.customElements.define("axial-list-item-base", AxialListItemBase);
export { AxialListItemBase }