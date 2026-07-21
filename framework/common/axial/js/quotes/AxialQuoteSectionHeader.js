"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialQuoteSectionHeader extends AxialComponentBase
{
    /// vars
    /** @type { Number | String } */
    #sectionNum;
    
    /** @type { String } */
    #sectionTitle;

    /// elements
    /** @type { HTMLElement } */
    #num;

    /** @type { HTMLElement } */
    #designation;


    constructor()
    {
        super();
        this.classList.add("axial_quote_section_header");
        this.template = "axial-quote-section-header-template";
    }

    get sectionNum() { return this.#sectionNum; }
    set sectionNum( value )
    {
        this.#sectionNum = value;
        if( this.#num && this.#sectionNum !== undefined )
        {
            this.#num.innerHTML = this.#sectionNum;
        }
    }

    get sectionTitle() { return this.#sectionTitle; }
    set sectionTitle( value )
    {
        this.#sectionTitle = value;
        if( this.#designation && this.#sectionTitle !== undefined )
        {
            this.#designation.innerHTML = this.#sectionTitle;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#num = this.shadowRoot.getElementById("num");
        this.#designation = this.shadowRoot.getElementById("designation");

        if( this.#num && this.#sectionNum !== undefined )
        {
            this.#num.innerHTML = this.#sectionNum;
        }

        if( this.#designation && this.#sectionTitle !== undefined )
        {
            this.#designation.innerHTML = this.#sectionTitle;
        }
    }
}

window.customElements.define("axial-quote-section-header", AxialQuoteSectionHeader);
export { AxialQuoteSectionHeader }