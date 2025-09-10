"use strict";

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminSearchPopup extends AxialAdminPopup
{
    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { HTMLElement } */
    #searchResult;

    /// events
    /** @type {Function } */
    #boundSearchInputHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-search-popup-template";
    }

    
    _buildComponent()
    {
        super._buildComponent();
        this.#searchInput = this.shadowRoot.getElementById("searchInput");
        this.#searchResult = this.shadowRoot.getElementById("searchResult");
    }

}

window.customElements.define("axial-admin-search-popup", AxialAdminSearchPopup);
export { AxialAdminSearchPopup }