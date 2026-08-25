"use strict";

import { AxialButton } from "../../button/AxialButton.js";
import { AxialList } from "../../list/AxialList.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialModuleProductListItem } from "./AxialModuleProductListItem.js";
import { AxialModuleProductCreatePopup } from "./AxialModuleProductCreatePopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialModuleProductActionsOverlay } from "./AxialModuleProductActionsOverlay.js";

class AxialModuleProductView extends AxialModuleView
{
    /// vars
    /** @type { Array } */
    #users;

    /** @type { String } */
    #apiProductListPath = "./api/product/list";

    /** @type { String } */
    #productCreatePopupId = "productCreatePopup";

    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialList } */
    #list;

    /** @type { AxialModuleProductCreatePopup } */
    #productCreatePopup;

    /** @type { AxialModuleProductActionsOverlay } */
    #productActionsOverlay;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundListChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-module-product-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);

        this.#apiProductListPath = PathUtils.getPathFromRelative( this.#apiProductListPath );
        this.getPath = this.#apiProductListPath;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#searchInput = this.shadowRoot.getElementById("searchInput");
        
        this.#list = this.shadowRoot.getElementById("list");
        this.#list.itemClass = AxialModuleProductListItem;
        this.#list.searchInput = this.#searchInput;
        this.#list.searchDataKeys.add("product_name");
        this.#list.addEventListener("listChanged", this.#boundListChangedHandler);

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

        this.#productCreatePopup = document.getElementById( this.#productCreatePopupId );

    }
    _prepareGetData()
    {
        return this.getPath;
    }

    _onGetResponse()
    {
        if( this.#list && this.getData.content)
        {
            this.#list.data = this.getData.content;
        }
    }

    #addHandler( event )
    {
        if( this.#productCreatePopup )
        {
            this.#productCreatePopup.data = undefined;
            this.#productCreatePopup.show();
        }
    }

    #listChangedHandler( event )
    {
        this.loadGetData();
    }
}
window.customElements.define("axial-module-product-view", AxialModuleProductView);
export { AxialModuleProductView }
