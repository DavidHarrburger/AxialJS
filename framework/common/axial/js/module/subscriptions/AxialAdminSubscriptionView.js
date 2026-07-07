"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";

import { AxialButton } from "../../button/AxialButton.js";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { AxialAdminSubscriptionListItem } from "./AxialAdminSubscriptionListItem.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialAdminSubscriptionPopup } from "./AxialAdminSubscriptionPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminSubscriptionView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #list;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialAdminSubscriptionPopup } */
    #popup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-subscription-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#list = this.shadowRoot.getElementById("list");
        if( this.#list )
        {
            this.#list.itemClass = AxialAdminSubscriptionListItem;
        }

        this.#addButton = this.shadowRoot.getElementById("addButton");
        if( this.#addButton )
        {
            this.#addButton.addEventListener("click", this.#boundAddHandler);
        }

        this.#popup = AxialPopupManager.getPopupById("subscriptionPopup");
        console.log(this.#popup);
    }

    /*
    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        console.log(userUuid);
        super._prepareGetData();
    }
    */
    

    _onGetResponse()
    {
        console.log("subscirption view get respone");
        
        if( this.#list && this.getData.content)
        {
            this.#list.data = this.getData.content;
        }
        
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #addHandler( event )
    {
        console.log("add button clicked")
        if( this.#popup ) { this.#popup.show(); }
    }
}
window.customElements.define("axial-admin-subscription-view", AxialAdminSubscriptionView);
export { AxialAdminSubscriptionView }
