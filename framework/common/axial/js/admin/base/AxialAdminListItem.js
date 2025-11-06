"use strict";

import { AxialAdminListItemBase } from "./AxialAdminListItemBase.js";
import { AxialDeletionButton } from "../button/AxialDeletionButton.js";
import { AxialEditButton } from "../button/AxialEditButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminListItem extends AxialAdminListItemBase
{
    /// vars
    /** @type { String } */
    #popupId;

    /// elements
    /** @type { HTMLElement } */
    #actions;

    /** @type { AxialEditButton } */
    #editButton;

    /** @type { AxialDeletionButton } */
    #deletionButton;

    /// events
    /** @type { Function } */
    #boundEditHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-list-item";
        this.#boundEditHandler = this.#editHandler.bind(this);
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get actions() { return this.#actions; }

    /**
     * @type { String }
     */
    get popupId() { return this.#popupId; }
    set popupId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#popupId = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#actions = this.shadowRoot.getElementById("actions");
        this.#deletionButton = this.shadowRoot.getElementById("deletionButton");
        this.#editButton = this.shadowRoot.getElementById("editButton");

        if( this.#deletionButton )
        {
            this.#deletionButton.style.display = "none";
        }
        
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
        console.log("IMPORTANT LIST ITEM", this.data);
        if( this.#deletionButton )
        {
            this.#deletionButton._id = this.data._id;
            this.#deletionButton.model = this.data.model;
        }

        if( this.#editButton )
        {
            this.#editButton.addEventListener("click", this.#boundEditHandler);
        }
    }

    #editHandler( event )
    {
        if( this.#popupId !== undefined )
        {
            const popup = AxialPopupManager.getPopupById( this.#popupId )
            if( popup )
            {
                this._onItemEdit();
                popup.data = this.data;
                popup.show();
            }
        }
    }

    /** @abstract */
    _onItemEdit() {}

}
window.customElements.define("axial-admin-list-item", AxialAdminListItem);
export { AxialAdminListItem }