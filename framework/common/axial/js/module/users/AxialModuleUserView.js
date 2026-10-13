"use strict";

import { AxialButton } from "../../button/AxialButton.js";
import { AxialList } from "../../list/AxialList.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
//import { AxialModuleCreateProjectOverlay } from "./AxialModuleCreateProjectOverlay.js";
import { AxialModuleUserListItem } from "./AxialModuleUserListItem.js";
import { AxialModuleUserCreatePopup } from "./AxialModuleUserCreatePopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialModuleUserView extends AxialModuleView
{
    /// vars
    /** @type { Array } */
    #users;

    /** @type { String } */
    #apiUserGetPath = "./api/user/list";

    /** @type { String } */
    #userCreatePopupId = "userCreatePopup";

    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialList } */
    #list;

    /** @type { AxialModuleUserCreatePopup } */
    #userCreatePopup;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundListChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-module-user-view-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);

        this.#apiUserGetPath = PathUtils.getPathFromRelative( this.#apiUserGetPath );
        this.getPath = this.#apiUserGetPath;

        this.overlayId = "userViewOverlay";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#searchInput = this.shadowRoot.getElementById("searchInput");
        
        this.#list = this.shadowRoot.getElementById("list");
        this.#list.itemClass = AxialModuleUserListItem;
        this.#list.searchInput = this.#searchInput;
        this.#list.searchDataKeys.add("first_name");
        this.#list.searchDataKeys.add("last_name");
        this.#list.addEventListener("listChanged", this.#boundListChangedHandler);

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

        this.#userCreatePopup = document.getElementById( this.#userCreatePopupId );

    }
    _prepareGetData()
    {
        return this.getPath;
    }

    _onGetResponse()
    {
        console.log("user view get respone");
        if( this.#list && this.getData.content)
        {
            this.#list.data = this.getData.content;
        }
    }

    #addHandler( event )
    {
        if( this.#userCreatePopup )
        {
            this.#userCreatePopup.data = undefined;
            this.#userCreatePopup.show();
        }
    }

    #listChangedHandler( event )
    {
        this.loadGetData();
    }
}
window.customElements.define("axial-module-user-view", AxialModuleUserView);
export { AxialModuleUserView }
