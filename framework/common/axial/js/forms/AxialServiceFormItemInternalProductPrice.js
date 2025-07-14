"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { AxialUploadTask } from "../upload/AxialUploadTask.js";

class AxialServiceFormItemInternalProductPrice extends AxialServiceFormItem
{
    /// elements
    /** @type { HTMLInputElement } */
    #costInput;

    /** @type { HTMLElement } */
    #stockSwitch;

    /** @type { HTMLInputElement } */
    #stockInput;

    /** @type { HTMLInputElement } */
    #coefInput;

    /** @type { HTMLSelectElement } */
    #taxSelect;

    /** @type { HTMLElement } */
    #subtotalNoTax;

    /** @type { HTMLElement } */
    #taxValue;

    /** @type { HTMLElement } */
    #subtotalWithTax;
    

    /// events
    /** @type { Function } */
    #boundInputChangeHandler;

    constructor()
    {
        super();
        this.template = "axial-service-form-item-internal-product-price-template";
        this.#boundInputChangeHandler = this.#inputChangeHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-direction", "axial-field" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#costInput = this.shadowRoot.getElementById("costInput");
        this.#coefInput = this.shadowRoot.getElementById("coefInput");
        this.#taxSelect = this.shadowRoot.getElementById("taxSelect");
        this.#stockInput = this.shadowRoot.getElementById("stockInput");

        this.#costInput.addEventListener("change", this.#boundInputChangeHandler);
        this.#coefInput.addEventListener("change", this.#boundInputChangeHandler);
        this.#taxSelect.addEventListener("change", this.#boundInputChangeHandler);

        this.#costInput.addEventListener("input", this.#boundInputChangeHandler);
        this.#coefInput.addEventListener("input", this.#boundInputChangeHandler);

        this.#subtotalNoTax = this.shadowRoot.getElementById("subtotalNoTax");
        this.#taxValue = this.shadowRoot.getElementById("taxValue");
        this.#subtotalWithTax = this.shadowRoot.getElementById("subtotalWithTax");
    }

    _checkValidity()
    {
        let finalValid = true;
        /// TO_CHECK : image not required
        /*
        if( (this.#fileInput && this.#fileInput.files[0]) || this.#image.src !== "" )
        {
            finalValid = true;
        }
        */
        return finalValid;
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        itemObject.value = new Array();

        const cost = isNaN(this.#costInput.valueAsNumber) === true ? 0 : this.#costInput.valueAsNumber;
        const coef = isNaN(this.#coefInput.valueAsNumber) === true ? 1 : this.#coefInput.valueAsNumber;
        const tax = Number(this.#taxSelect.value);
        const stock = this.#stockInput.valueAsNumber;

        itemObject.value.push(
            { field: "cost", value: cost },
            { field: "coef", value: coef },
            { field: "tax", value: tax },
            { field: "stock", value: stock }
        );

        return itemObject;
    }

    _fillItem( object )
    {
        this.#fillItem(object);
    }

    #fillItem( object )
    {
        console.log("#fillItem AxialServiceFormItemInternalProductPrice");
        console.log( object );
    }

    #inputChangeHandler( event )
    {

        const cost = isNaN(this.#costInput.valueAsNumber) === true ? 0 : this.#costInput.valueAsNumber;
        const coef = isNaN(this.#coefInput.valueAsNumber) === true ? 1 : this.#coefInput.valueAsNumber;;
        const tax = Number(this.#taxSelect.value);

        const tht = cost * coef;
        const mht = tht - cost; // marge
        const tva = tht * tax / 100;
        const ttc = tht + tva;

        console.log( cost, coef, tax);
        console.log( tht, tva, ttc);

        this.#subtotalNoTax.innerHTML = `${tht.toFixed(2)}€`;
        this.#taxValue.innerHTML = `${tva.toFixed(2)}€`;
        this.#subtotalWithTax.innerHTML = `${ttc.toFixed(2)}€`;
    }
    
}

window.customElements.define("axial-service-form-item-internal-product-price", AxialServiceFormItemInternalProductPrice);
export { AxialServiceFormItemInternalProductPrice }