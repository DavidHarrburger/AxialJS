"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialButton } from "../../button/AxialButton.js";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { AxialAdminUserListItem } from "./AxialAdminUserListItem.js";
import { AxialAdminList } from "../base/AxialAdminList.js";

class AxialAdminUserView extends AxialAdminViewBase
{
    /** @type { AxialAdminList } */
    #list;

    constructor()
    {
        super();
        this.template = "axial-admin-user-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#list = this.shadowRoot.getElementById("list");
        if( this.#list )
        {
            this.#list.itemClass = AxialAdminUserListItem;
        }
    }

    _onGetResponse()
    {
        console.log("user view get respone");
        if( this.#list && this.getData.content)
        {
            this.#list.data = this.getData.content;
        }
    }
}
window.customElements.define("axial-admin-user-view", AxialAdminUserView);
export { AxialAdminUserView }
