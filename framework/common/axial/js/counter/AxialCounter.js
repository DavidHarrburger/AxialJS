"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialCounter extends AxialComponentBase
{
    /** @type { Number } */
    #min = 1;

    /** @type { Number } */
    #max;

    /** @type { Number } */
    #count = 1;

    /// elements;
    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #counter

    /** @type { HTMLElement } */
    #maximum;

    constructor()
    {
        super();
        this.classList.add("axial_counter");
        this.template = "axial-counter-template";
    }


    get count() { return this.#count; }
    set count( value )
    {
        console.log( value );
        if( isNaN(value) === true ) { throw new TypeError("Positive Integer value required"); }
        if( value < 0 ) { throw new TypeError("Positive Integer value required"); }
        if( Number.isInteger( value ) === false ) { throw new TypeError("Positive Integer value required"); }

        this.#count = value;
        this.#counter.innerHTML = this.#count;
    }

    get max() { return this.#max; }
    set max( value )
    {
        if( isNaN(value) === true ) { throw new TypeError("Positive Integer value required"); }
        if( value < 0 ) { throw new TypeError("Positive Integer value required"); }
        if( Number.isInteger( value ) === false ) { throw new TypeError("Positive Integer value required"); }

        this.#max = value;
        if( this.#maximum )
        {
            this.#maximum.innerHTML = this.#max;
        }
        
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#counter = this.shadowRoot.getElementById("counter");
        this.#maximum = this.shadowRoot.getElementById("maximum");

        if( this.#max && this.#maximum )
        {
            this.#maximum.innerHTML = this.#max;
        }
    }
}

window.customElements.define("axial-counter", AxialCounter);
export { AxialCounter }