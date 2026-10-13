"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialQuoteItem extends AxialComponentBase
{
    /// vars
    /** @type {String } */
    #itemNum;

    /** @type { String } */
    #backgroundColor; // transparent | f8f9fb

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

    get backgroundColor() { return this.#backgroundColor; }
    set backgroundColor( value )
    {
        if( CSS.supports( "background-color", value ) === false )
        {
            throw new Error("CSS value not supported")
        }
        this.#backgroundColor = value;
        if( this.componentBuilt === true )
        {
            this.style.backgroundColor = this.#backgroundColor;
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
        if( this.#backgroundColor !==  undefined )
        {
            this.style.backgroundColor = this.#backgroundColor;
        }
        const product = this.data.product;

        const isQtyInt = Number.isInteger(this.data.quantity);
        let qty = isQtyInt === false ? Number( Number(this.data.quantity).toFixed(2) ) : this.data.quantity;
        if( product.unit.toLowerCase() == "forf" )
        {
            qty = 1;
        }

        const priceUnit = product.price ?? product.puht;
        const priceTotal = priceUnit * qty;
        const tax = product.tax;
        const taxValue = priceTotal * tax / 100;
        const ttc = priceTotal + taxValue;

        this.#designation.innerHTML = product.quote_label ?? product.designation;
        this.#quantity.innerHTML = qty;
        this.#unit.innerHTML = product.unit;
        
        this.#priceUnit.innerHTML = priceUnit.toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } )
        this.#priceTotal.innerHTML = priceTotal.toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } )
        this.#tax.innerHTML = tax + "%";
        
        this.#priceTotalTax.innerHTML = ttc.toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } )
    }
}

window.customElements.define("axial-quote-item", AxialQuoteItem);
export { AxialQuoteItem }