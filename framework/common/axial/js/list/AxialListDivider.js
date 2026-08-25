"use strict";

import { AxialInputBase } from "../core/AxialInputBase.js";
import { StringUtils } from "../utils/StringUtils.js";
import { AxialListItem } from "./AxialListItem.js";

class AxialListDivider extends AxialListItem
{
    /// vars
    /** @type { String } */
    #titleText;

    /** @type { String } */
    #titleDataField;

    /// elements
    /** @type { HTMLElement } */
    #title;

    constructor()
    {
        super();
        this.classList.add("axial_list_divider");
        this.template = "axial-list-divider-template";
    }

    /**
     * @type { String }
     */
    get titleText() { return this.#titleText; }
    set titleText( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#titleText = value;
        this.#title.innerHTML = this.#titleText;
    }

    get titleDataField() { return this.#titleDataField; }
    set titleDataField( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("No white string here");
        }
        this.#titleDataField = value;
    }

    _buildComponent()
    {
        this.#title = this.shadowRoot.getElementById("title");
        super._buildComponent();
    }

   _updateComponent()
   {
        super._updateComponent();
        if( this.#titleDataField && this.#title )
        {
            const tempText = this.data[this.#titleDataField];
            console.log("divider should update", tempText)
            if( tempText )
            {
                this.#titleText = tempText;
                this.#title.innerHTML = this.#titleText;
            }
        }
   }
   
    _getAsObject()
    {
        const dividerObject =
        {
            title: this.#titleText,
            itemType: "divider"
        }
        return dividerObject;
    }
}

window.customElements.define("axial-list-divider", AxialListDivider);
export { AxialListDivider }