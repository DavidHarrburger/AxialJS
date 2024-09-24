"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";

class AxialAdminProductItem extends AxialComponentBase
{
    

    constructor()
    {
        super();
        this.classList.add("axial_admin_product_item");
        this.template = "axial-admin-product-item-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        
    }

    _onDataChanged()
    {
        try
        {
            
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-admin-product-item", AxialAdminProductItem);
export { AxialAdminProductItem }