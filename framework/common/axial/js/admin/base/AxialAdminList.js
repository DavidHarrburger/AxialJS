"use strict";

import { AxialComponentBase } from "../../core/AxialComponentBase.js";

import { DomUtils } from "../../utils/DomUtils.js";

import { AxialAdminListItemBase } from "./AxialAdminListItemBase.js";

class AxialAdminList extends AxialComponentBase
{
    /// vars
    /** @type { Function } */
    #itemClass;

    ///elemets
    /** @type { HTMLElement } */
    #header;

    /** @type { HTMLSlotElement } */
    #headerSlot;

    /** @type { HTMLElement } */
    #content;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list");
        this.template = "axial-admin-list-template";
    }

    get itemClass() { return this.#itemClass; }
    set itemClass( value )
    {
        if( typeof value === "function" && AxialAdminListItemBase.prototype.isPrototypeOf( new value() ) === true )
        {
            this.#itemClass = value;
        }
        
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#header = this.shadowRoot.getElementById("header");
        this.#headerSlot = this.shadowRoot.getElementById("headerSlot");
        this.#content = this.shadowRoot.getElementById("content");

        if( this.#headerSlot )
        {
            const headerElements = this.#headerSlot.assignedElements();
            for( const he of headerElements )
            {
                he.style.color = "#aaa";
                he.style.textAlign = "left";
                he.style.textTransform = "uppercase";
                he.style.fontSize = "14px";
                he.style.fontWeight = "700";
            }
        }
        
        
        this.#updateComponent();
    }

    _onDataChanged()
    {
        this.#updateComponent();
    }

    #updateComponent()
    {
        if( this.data !== null && this.data !== undefined && Array.isArray(this.data) === true )
        {
            console.log("data in list");
            console.log(this.data);
            if( this.#content && this.#itemClass )
            {
                DomUtils.cleanElement( this.#content );
                for( const obj of this.data )
                {
                    const item = new this.#itemClass();
                    item.data = obj;
                    this.#content.appendChild( item );
                }
            }
        }
    }


}

window.customElements.define("axial-admin-list", AxialAdminList);
export { AxialAdminList }