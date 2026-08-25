"use strict";

import { AxialForm } from "../../forms/AxialForm.js";

class AxialModuleProductForm extends AxialForm
{
    /** @type { HTMLElement} */
    #productUuid;

    constructor()
    {
        super();
        this.template = "axial-module-product-form-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#productUuid = this.shadowRoot.getElementById("productUuid");
    }
    _fillForm( object )
    {
        super._fillForm(object);
        console.log(object);
        if( this.#productUuid && object.uuid )
        {
            if( object.uuid )
            {
                this.#productUuid.innerHTML = object.uuid;
            }
            else
            {
                this.#productUuid.innerHTML = "";
            }
        }
        
    }

    clearForm()
    {
        super.clearForm();
        this.#productUuid.innerHTML = "";
    }
}

window.customElements.define("axial-module-product-form", AxialModuleProductForm);
export { AxialModuleProductForm }