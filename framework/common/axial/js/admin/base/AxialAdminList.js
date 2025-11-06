"use strict";

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { AxialAdminListItemBase } from "./AxialAdminListItemBase.js";
import { DomUtils } from "../../utils/DomUtils.js";

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

    /** @type { String } */
    #dateFilter = "creation_date";

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
            if(headerElements.length === 0 )
            {
                this.#header.style.display = "none";
            }
            else
            {
                for( const he of headerElements )
                {
                    he.style.color = "#5c5c5cff";
                    //he.style.textAlign = "left";
                    he.style.textTransform = "uppercase";
                    he.style.fontSize = "14px";
                    he.style.fontWeight = "700";
                }
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
            //console.log("data in list");
            //console.log(this.data);
            this.data.sort( this.#dateSorter );
            if( this.#content && this.#itemClass )
            {
                const children = this.#content.children;
                const cl = children.length;
                const dl = this.data.length;

                //console.log( children, cl, dl);
                if( cl === 0 && dl === 0 ) { return; }
                if( cl === 0 && dl > 0 )
                {
                    for( let i = 0; i < dl; i++ )
                    {
                        const itemData = this.data[i];
                        const item = new this.#itemClass();
                        item.data = itemData;
                        this.#content.appendChild( item );
                    }
                }
                else if( cl === dl )
                {
                    for( let i = 0; i < dl; i++ )
                    {
                        const itemData = this.data[i];
                        const item = children[i];
                        item.data = itemData;
                    }
                }
                else if( dl > cl )
                {
                    for( let i = 0; i < dl; i++ )
                    {
                        const itemData = this.data[i];
                        if( i <= (cl-1) )
                        {
                            const item = children[i];
                            item.data = itemData;
                        }
                        else
                        {
                            const item = new this.#itemClass();
                            item.data = itemData;
                            this.#content.appendChild( item );
                        }
                    }
                }
                else if( dl < cl )
                {
                    for( let i = 0; i < cl; i++ )
                    {
                        const itemData = this.data[i];
                        const item = children[i];
                        if( i <= (dl-1) )
                        {
                            item.data = itemData;
                        }
                        else
                        {
                            item.remove();
                        }
                    }
                }
            }
        }
    }

    #dateSorter( a, b )
    {
        let r = 0;
        if( a.creation_date && b.creation_date )
        {
            const ad = new Date(a.creation_date);
            const bd = new Date(b.creation_date);

            if( ad < bd )
            {
                r = 1;
            }
            else if( ad > bd )
            {
                r = -1;
            }
            else
            {
                r = 0;
            }
        }
        return r;
    }

    empty()
    {
        if( this.#content )
        {
            DomUtils.cleanElement( this.#content );
        }
    }
}

window.customElements.define("axial-admin-list", AxialAdminList);
export { AxialAdminList }