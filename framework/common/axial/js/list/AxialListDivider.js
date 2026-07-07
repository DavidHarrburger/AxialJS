"use strict";

import { AxialInputBase } from "../core/AxialInputBase.js";
import { AxialListItem } from "./AxialListItem.js";

class AxialListDivider extends AxialListItem
{
    /// vars
    /** @type { String } */
    #title = "DIVIDER";

    /// elements
    /** @type { AxialInputBase } */
    #titleInput;

    /// events
    /** @type { Function } */
    #boundFinalValueChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_list_divider");
        this.template = "axial-list-divider-template";
        this.#boundFinalValueChangedHandler = this.#finalValueChangedHandler.bind(this);
    }

    /**
     * @type { AxialInputBase }
     * @readonly
     */
    get titleInput() { return this.#titleInput; }

    /**
     * @type { String }
     */
    get title() { return this.#title; }
    set title( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#title = value;
        if( this.#titleInput )
        {
            this.#titleInput.value = this.#title;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#titleInput = this.shadowRoot.getElementById("titleInput");
        if( this.#titleInput )
        {
            this.#titleInput.addEventListener("finalValueChanged", this.#boundFinalValueChangedHandler);
        }

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
        if(this.data.title )
        {
            this.title = this.data.title;
        }
    }

    _getAsObject()
    {
        const dividerObject =
        {
            title: this.#titleInput.value,
            itemType: "divider"
        }
        return dividerObject;
    }

    #finalValueChangedHandler( event )
    {
        const listItemEvent = new CustomEvent( "listDividerChanged", { bubbles: true } );
        this.dispatchEvent( listItemEvent );
    }
}

window.customElements.define("axial-list-divider", AxialListDivider);
export { AxialListDivider }