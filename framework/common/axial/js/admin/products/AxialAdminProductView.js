"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";

import { AxialButton } from "../../button/AxialButton.js";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
//import { AxialAdminUserListItem } from "./AxialAdminUserListItem.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialAdminProductPopup } from "./AxialAdminProductPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminProductView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #list;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialAdminProductPopup } */
    #productPopup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-product-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#list = this.shadowRoot.getElementById("list");
        if( this.#list )
        {
            //this.#list.itemClass = AxialAdminUserListItem;
        }

        this.#addButton = this.shadowRoot.getElementById("addButton");
        if( this.#addButton )
        {
            this.#addButton.addEventListener("click", this.#boundAddHandler);
        }

        this.#productPopup = AxialPopupManager.getPopupById("productPopup");
        console.log(this.#productPopup);
    }

    _onGetResponse()
    {
        console.log("user view get respone");
        /*
        if( this.#list && this.getData.content)
        {
            this.#list.data = this.getData.content;
        }
        */
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #addHandler( event )
    {
        console.log("add button clicked")
        if( this.#productPopup ) { this.#productPopup.show(); }
    }
}
window.customElements.define("axial-admin-product-view", AxialAdminProductView);
export { AxialAdminProductView }
