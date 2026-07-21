"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialQuoteItem extends AxialComponentBase
{
    /// vars
    /** @type {String } */
    #itemNum;

    /// elements
    /** @type { HTMLElement } */
    #num;

    /** @type { HTMLElement } */
    #designation;

    /** @type { HTMLElement } */
    #quantity;

    /** @type { HTMLElement } */
    #unit;

    /** @type { HTMLElement } */
    #priceUnit;

    /** @type { HTMLElement } */
    #priceTotal;

    /** @type { HTMLElement } */
    #tax;

    /** @type { HTMLElement } */
    #priceTotalTax;

    constructor()
    {
        super();
        this.classList.add("axial_quote_item");
        this.template = "axial-quote-item-template";
    }

    get itemNum() { return this.#itemNum; }
    set itemNum( value )
    {
        this.#itemNum = value;
        if( this.#num && this.#itemNum !== undefined )
        {
            this.#num.innerHTML = this.#itemNum;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#num = this.shadowRoot.getElementById("num");
        this.#designation = this.shadowRoot.getElementById("designation");
        this.#quantity = this.shadowRoot.getElementById("quantity");
        this.#unit = this.shadowRoot.getElementById("unit");
        this.#priceUnit = this.shadowRoot.getElementById("priceUnit");
        this.#priceTotal = this.shadowRoot.getElementById("priceTotal");
        this.#tax = this.shadowRoot.getElementById("tax");
        this.#priceTotalTax = this.shadowRoot.getElementById("priceTotalTax");

        if( this.#num && this.#itemNum !== undefined )
        {
            this.#num.innerHTML = this.#itemNum;
        }

        if( this.data !== undefined )
        {
            this.#updateComponent();
        }

    }

    _onDataChanged()
    {
        if( this.componentBuilt === true )
        {
            this.#updateComponent();
        }
    }

    #updateComponent()
    {
        //console.log( this.data );
        const article = this.data.article;
        const qty = this.data.quantity;

        const value = Number(article.value);
        const price = Number( article.value * qty );
        const tax = Number(article.tax);
        const taxValue = price * tax / 100;
        const ttc = price + taxValue;

        this.#designation.innerHTML = article.quote_label;
        this.#quantity.innerHTML = qty;
        this.#unit.innerHTML = article.unit;
        this.#priceUnit.innerHTML = value.toFixed(2);
        this.#priceTotal.innerHTML = price.toFixed(2);
        this.#tax.innerHTML = article.tax + "%";
        this.#priceTotalTax.innerHTML = ttc.toFixed(2);
    }
}

window.customElements.define("axial-quote-item", AxialQuoteItem);
export { AxialQuoteItem }