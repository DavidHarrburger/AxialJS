"use strict";

import { AxialListItem } from "../../list/AxialListItem.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleSearchListItem extends AxialListItem
{
    /// vars
    /** @type { Array } */
    #displayedFields = ["first_name", "last_name"];

    /** @type { HTMLElement } */
    #field;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #actions;

    /// events
    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_module_search_list_item");
        this.template = "axial-module-search-list-item-template";

        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get field() { return this.#field; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get actions() { return this.#actions; }

    get displayedFields() { return this.#displayedFields; }
    set displayedFields( value )
    {
        if( Array.isArray( value ) === false )
        {
            throw new TypeError("Array required");
        }
        this.#displayedFields = value;
    }

    _buildComponent()
    {
        
        this.#name = this.shadowRoot.getElementById("name");
        this.addEventListener("click", this.#boundClickHandler);

        super._buildComponent();
    }

    _onDataChanged()
    {
        super._onDataChanged();
    }

    _updateComponent()
    {
        let inner = "";
        for( const prop of this.#displayedFields )
        {
            inner = inner + this.data[prop] + " ";
        }
        this.#name.innerHTML = inner;
    }

    #clickHandler( event )
    {
        console.log("search item clicked");
        const searchItemEvent = new CustomEvent("searchItemSelected", { bubbles: true, detail: {data: this.data } });
        this.dispatchEvent(searchItemEvent);
    }

}
window.customElements.define("axial-module-search-list-item", AxialModuleSearchListItem);
export { AxialModuleSearchListItem }