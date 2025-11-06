"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialButton } from "../../button/AxialButton.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialAdminUserListItem } from "./AxialAdminUserListItem.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminUserView extends AxialAdminViewBase
{
    /** @type { AxialAdminList } */
    #list;

    /** @type { AxialButton } */
    #addButton

    /** @type { String } */
    #subscriptionPath = "./api/data/get/?c=products&f=type,subscription&m=product";

    /** @type { Array } */
    #subscriptions;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-user-view-template";
        this.#subscriptionPath = PathUtils.getPathFromRelative(this.#subscriptionPath);
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddButtonHandler);

        this.#list = this.shadowRoot.getElementById("list");
        if( this.#list )
        {
            this.#list.itemClass = AxialAdminUserListItem;
        }
    }

    _prepareGetData()
    {
        const path = this.getPath + "?c=users&m=user&f=model,user";
        return path;
    }

    async #getSubscriptions()
    {
        try
        {
            const response = await fetch( this.#subscriptionPath, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            this.#subscriptions = json.content;
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async loadGetData()
    {
        //await this.#getSubscriptions();
        super.loadGetData();
    }

    _onGetResponse()
    {
        console.log("user view get respone");
        //console.log( this.#subscriptions );
        if( this.#list && this.getData.content)
        {
            /*
            for( const dataItem of this.getData.content )
            {
                dataItem.subscriptions = this.#subscriptions;
            }
            */
            this.#list.data = this.getData.content;
        }
    }

    #addButtonHandler( event )
    {
        const userPopup = AxialPopupManager.getPopupById("userPopup");
        if( userPopup )
        {
            userPopup.data = undefined;
            userPopup.show();
        }
    }
}
window.customElements.define("axial-admin-user-view", AxialAdminUserView);
export { AxialAdminUserView }
