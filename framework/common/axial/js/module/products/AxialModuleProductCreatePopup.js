"use strict";

import { AxialForm } from "../../forms/AxialForm.js";
import { AxialModuleProductForm } from "./AxialModuleProductForm.js";
import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleProductCreatePopup extends AxialModulePopup
{
    /// vars
    /** @type { String } */
    #productCreatePath = "./api/product/create";
    
    /// elements
    /** @type { AxialModuleProductForm } */
    #form;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();

        this.classList.add("axial_module_product_create_popup");
        this.template = "axial-module-product-create-popup-template";

        this.#productCreatePath = PathUtils.getPathFromRelative(this.#productCreatePath);
        
        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;

        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialModuleProductForm }
     * @readonly
     */
    get form() { return this.#form; }

    _buildComponent()
    {
        super._buildComponent();
        this.#form = this.shadowRoot.getElementById("form");
        if( this.#form )
        {
            this.#form.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#form )
        {
            if( this.data === undefined )
            {
                this.title = "Ajouter un produit";
                this.#form.postPath = this.#productCreatePath;
                this.#form.clearForm();
            }
            else
            {
                this.#form._fillForm( this.data );
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Produit enregistré avec succès");
        this.hide();
    }
}

window.customElements.define("axial-module-product-create-popup", AxialModuleProductCreatePopup);
export { AxialModuleProductCreatePopup }