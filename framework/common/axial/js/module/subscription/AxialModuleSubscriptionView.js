"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";

import { AxialModuleSubscriptionListItem } from "./AxialModuleSubscriptionListItem.js";

import { AxialModuleSubscriptionPopup } from "./AxialModuleSubscriptionPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialList } from "../../list/AxialList.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleSubscriptionView extends AxialModuleView
{
    /// vars
    /** @type { String } */
    #subscriptionPopupId = "subscriptionPopup";

    /** @type { String } */
    #subscriptionListPath = "./api/subscription/list";

    /// elements
    /** @type { AxialList } */
    #list;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialModuleSubscriptionPopup } */
    #subscriptionPopup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-module-subscription-view-template";
        this.#subscriptionListPath = PathUtils.getPathFromRelative( this.#subscriptionListPath);
        this.getPath = this.#subscriptionListPath;
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#list = this.shadowRoot.getElementById("list");
        if( this.#list )
        {
            this.#list.itemClass = AxialModuleSubscriptionListItem;
        }

        this.#addButton = this.shadowRoot.getElementById("addButton");
        if( this.#addButton )
        {
            this.#addButton.addEventListener("click", this.#boundAddHandler);
        }

        this.#subscriptionPopup = AxialPopupManager.getPopupById(this.#subscriptionPopupId);
    }

    

    _onGetResponse()
    {
        let subs = this.getData.content;
        let subsOk = [];
        if( subs !== null )
        {
            if( Array.isArray(subs) === true )
            {
                subsOk = subs;
            }
            else
            {
                subsOk.push(subs);
            }
            this.#list.data = subsOk;
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #addHandler( event )
    {
        if( this.#subscriptionPopup ) { this.#subscriptionPopup.show(); }
    }
}
window.customElements.define("axial-module-subscription-view", AxialModuleSubscriptionView);
export { AxialModuleSubscriptionView }
