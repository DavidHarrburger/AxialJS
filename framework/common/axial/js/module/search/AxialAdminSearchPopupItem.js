"use strict";

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialAdminSearchPopupItem extends AxialComponentBase
{
    /// vars
    /** @type { Array } */
    #displayedFields;

    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #field;

    /** @type { HTMLElement } */
    #actions;

    /// events
    /** @type { Function } */
    #boundClickHandler;

    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_search_popup_item");
        this.template = "axial-admin-search-popup-item-template";

        this.#boundClickHandler = this.#clickHandler.bind(this);
        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);
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
        super._buildComponent();

        this.#background = this.shadowRoot.getElementById("background");
        this.#photo = this.shadowRoot.getElementById("photo");
        this.#field = this.shadowRoot.getElementById("field");
        this.#actions = this.shadowRoot.getElementById("actions");

        this.addEventListener("click", this.#boundClickHandler);
        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);

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
        //console.log("POPUP SEARCH ITEM DATA", this.data);
        if( this.data.image_main )
        {
            this.#photo.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.data.image_main)}')`;
        }
        
        let displayedValue = "";
        if( this.#field )
        {
            for( const fieldName of this.#displayedFields )
            {
                //console.log( this.data[fieldName] );
                const tempValue = this.data[fieldName];
                if( tempValue )
                {
                    displayedValue = displayedValue + tempValue + " ";
                }
            }
            this.#field.innerHTML = displayedValue;
        }
    }

    #clickHandler( event )
    {
        console.log("search item clicked");
        const searchItemEvent = new CustomEvent("searchItemSelected", { bubbles: true, detail: this.data });
        this.dispatchEvent(searchItemEvent);
    }

    #enterHandler( event )
    {
        this.#background.style.backgroundColor = "rgba(4, 99, 177, 0.23)";
    }

    #leaveHandler( event )
    {
        this.#background.style.backgroundColor = "rgba(255,255,255,1)";
    }
}
window.customElements.define("axial-admin-search-popup-item", AxialAdminSearchPopupItem);
export { AxialAdminSearchPopupItem }