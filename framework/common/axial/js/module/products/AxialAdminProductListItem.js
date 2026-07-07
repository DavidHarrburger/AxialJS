"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialAdminProductListItem extends AxialAdminListItemBase
{
    /// elements
    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #price;

    /** @type { HTMLElement } */
    #type;
    
    /** @type { HTMLElement } */
    #state;

    /** @type { HTMLElement } */
    #creation;

    /** @type { HTMLElement } */
    #actions;


    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-product-list-item-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#photo = this.shadowRoot.getElementById("photo");
        this.#name = this.shadowRoot.getElementById("name");
        //this.#cost = this.shadowRoot.getElementById("price");
        //this.#coef = this.shadowRoot.getElementById("coef");
        //this.#tax = this.shadowRoot.getElementById("tax");
        
        this.#actions = this.shadowRoot.getElementById("actions");

        this.#updateComponent();
    }

    _onDataChanged()
    {
        this.#updateComponent();
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            if( this.data.image_main !== "" )
            {
                this.#photo.src = PathUtils.getPathFromRelative(this.data.image_main);
            }

            this.#name.innerHTML = this.data.product_name;
            //this.#cost.innerHTML = this.data.cost;
            //this.#coef.innerHTML = this.data.coef;
            //this.#tax.innerHTML = this.data.tax + "%";
            
            
        }
    }
}

window.customElements.define("axial-admin-product-list-item", AxialAdminProductListItem);
export { AxialAdminProductListItem }