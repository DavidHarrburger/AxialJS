"use strict";

import { AxialAdminListItemBase } from "./AxialAdminListItemBase.js";
import { AxialDeletionButton } from "../button/AxialDeletionButton.js";

class AxialAdminListItem extends AxialAdminListItemBase
{
    /// elements
    /** @type { HTMLElement } */
    #actions;

    /** @type { AxialDeletionButton } */
    #deletionButton;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-list-item";
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get actions() { return this.#actions; }

    _buildComponent()
    {
        super._buildComponent();

        this.#actions = this.shadowRoot.getElementById("actions");
        this.#deletionButton = this.shadowRoot.getElementById("deletionButton");

        if( this.data )
        {
            this.#updateComponent();
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();

        if( this.componentBuilt === true )
        {
            this.#updateComponent();
        }
    }

    #updateComponent()
    {
        console.log( "IMPORTANT LIST ITEM")
        console.log( this.data);
        if( this.#deletionButton )
        {
            this.#deletionButton._id = this.data._id;
            this.#deletionButton.model = this.data.model;
        }
    }

}
window.customElements.define("axial-admin-list-item", AxialAdminListItem);
export { AxialAdminListItem }