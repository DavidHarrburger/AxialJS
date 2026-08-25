"use strict";

import { AxialListItem } from "../../list/AxialListItem.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { FormatUtils } from "../../utils/FormatUtils.js";
import { UnitUtils } from "../../utils/UnitUtils.js";
import { ProductUtils } from "../../utils/ProductUtils.js";

import { AxialModuleProductCreatePopup } from "./AxialModuleProductCreatePopup.js";

class AxialModuleProductListItem extends AxialListItem
{
    /// vars
    /** @type { String } */
    #productUpdatePath = "./api/product/update";

    /// elements
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #ref;

    /** @type { HTMLElement } */
    #kind;

    /** @type { HTMLElement } */
    #unit;
    
    /** @type { HTMLElement } */
    #price;

    /** @type { HTMLElement } */
    #tax;

    /** @type { HTMLElement } */
    #created;

    /** @type { HTMLElement } */
    #modified;

    /** @type { HTMLElement } */
    #actions;


    constructor()
    {
        super();
        this.template = "axial-module-product-list-item-template";
        this.#productUpdatePath = PathUtils.getPathFromRelative(this.#productUpdatePath);
        this.popupId = "productCreatePopup";
    }

    _buildComponent()
    {
        this.#name     = this.shadowRoot.getElementById("name");
        //this.#ref      = this.shadowRoot.getElementById("ref");
        //this.#kind     = this.shadowRoot.getElementById("kind");
        
        this.#price    = this.shadowRoot.getElementById("price");
        this.#unit     = this.shadowRoot.getElementById("unit");
        this.#tax      = this.shadowRoot.getElementById("tax");
        this.#created  = this.shadowRoot.getElementById("created");
        this.#modified = this.shadowRoot.getElementById("modified");
        
        super._buildComponent();
    }

    _updateComponent()
    {
        super._updateComponent();

        //console.log( this.data);

        this.#name.innerHTML = this.data?.product_name;
        //this.#ref.innerHTML = this.data?.product_ref;

        this.#price.innerHTML = Number(this.data?.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2 }) + " €";
        this.#name.innerHTML = this.data?.product_name;
        
        //const kindValue = ProductUtils.KINDS.get( this.data.kind );
        //this.#kind.innerHTML = kindValue;

        const unitText = UnitUtils.UNITS.get(this.data.unit).default;
        this.#unit.innerHTML = this.data.unit;

        this.#tax.innerHTML = `${this.data.tax} %`;

        this.#created.innerHTML  = DateUtils.format( new Date( this.data?.creation_date ) );


    }

    /**
     * 
     * @param { AxialModuleProductCreatePopup } popup 
     */
    _onItemEdit( popup )
    {
        super._onItemEdit( popup );
        popup.form.postPath = this.#productUpdatePath;
        popup.title = `Modifier '${this.data.product_name}'`;
    }
}

window.customElements.define("axial-module-product-list-item", AxialModuleProductListItem);
export { AxialModuleProductListItem }