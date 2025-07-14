"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminList } from "../base/AxialAdminList.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialAdminInternalProductPopup } from "./AxialAdminInternalProductPopup.js";
import { AxialAdminInternalProductListItem } from "./AxialAdminInternalProductListItem.js";

class AxialAdminInternalProductView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialAdminList } */
    #productList;

    /** @type { AxialButton } */
    #addProductButton;

    /** @type { AxialAdminInternalProductPopup } */
    #internalProductPopup;

    /// events
    /** @type { Function } */
    #boundAddButtonHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-internal-product-view-template";
        this.#boundAddButtonHandler = this.#addButtonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#productList = this.shadowRoot.getElementById("productList");
        this.#productList.itemClass = AxialAdminInternalProductListItem;

        this.#addProductButton = this.shadowRoot.getElementById("addProductButton");
        this.#addProductButton.addEventListener("click", this.#boundAddButtonHandler);
    }

    _prepareGetData()
    {
        const userUuid = window.AXIAL.userUuid;
        const path = this.getPath + "&f=model,product_internal&f=user_uuid," + userUuid;
        return path;
    }

    _onGetResponse()
    {
        const products = this.getData.content;
        console.log("product view data ", products);
        if( this.#productList )
        {
            this.#productList.data = products;
        }
    }

    #addButtonHandler( event )
    {
        this.#internalProductPopup = AxialPopupManager.getPopupById("internalProductPopup");
        if( this.#internalProductPopup )
        {
            const userUuid = window.AXIAL.userUuid;
            const defaultUuid = "user_uuid," + userUuid;
            this.#internalProductPopup.form.setAttribute("axial-defaults", defaultUuid);
            this.#internalProductPopup.title = "Ajouter un produit / service / main d'oeuvre";
            this.#internalProductPopup.show();
        }
    }

}
window.customElements.define("axial-admin-internal-product-view", AxialAdminInternalProductView);
export { AxialAdminInternalProductView }