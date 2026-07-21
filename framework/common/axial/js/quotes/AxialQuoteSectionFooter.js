"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialQuoteSectionFooter extends AxialComponentBase
{
    /// vars
    /** @type { Number | String } */
    #sectionNum;
    
    /** @type { String } */
    #sectionTitle;

    /** @type { String } */
    #HT;

    /** @type { String } */
    #TVA;

    /** @type { String } */
    #TTC;

    /// elements
    /** @type { HTMLElement } */
    #num;

    /** @type { HTMLElement } */
    #designation;

    /** @type { HTMLElement } */
    #totalHt;

    /** @type { HTMLElement } */
    #totalTax;

    /** @type { HTMLElement } */
    #totalTtc;

    constructor()
    {
        super();
        this.classList.add("axial_quote_section_footer");
        this.template = "axial-quote-section-footer-template";
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

    get HT() { return this.#HT; }
    set HT( value )
    {
        this.#HT = value;
        if( this.#totalHt && this.#HT !== undefined )
        {
            this.#totalHt.innerHTML = this.#HT;
        }
    }

    get TVA() { return this.#TVA; }
    set TVA( value )
    {
        this.#TVA = value;
        if( this.#totalTax && this.#TVA !== undefined )
        {
            this.#totalTax.innerHTML = this.#TVA;
        }
    }

    get TTC() { return this.#TTC; }
    set TTC( value )
    {
        this.#TTC = value;
        if( this.#totalTtc && this.#TTC !== undefined )
        {
            this.#totalTtc.innerHTML = this.#TTC;
        }
    }
    

    _buildComponent()
    {
        super._buildComponent();

        this.#num = this.shadowRoot.getElementById("num");
        this.#designation = this.shadowRoot.getElementById("designation");
        this.#totalHt = this.shadowRoot.getElementById("totalHt");
        this.#totalTax = this.shadowRoot.getElementById("totalTax");
        this.#totalTtc = this.shadowRoot.getElementById("totalTtc");

        if( this.#num && this.#sectionNum !== undefined )
        {
            this.#num.innerHTML = this.#sectionNum;
        }

        if( this.#designation && this.#sectionTitle !== undefined )
        {
            this.#designation.innerHTML = this.#sectionTitle;
        }

        if( this.#totalHt && this.#HT !== undefined )
        {
            this.#totalHt.innerHTML = this.#HT;
        }

        if( this.#totalTax && this.#TVA !== undefined )
        {
            this.#totalTax.innerHTML = this.#TVA;
        }
        
        if( this.#totalTtc && this.#TTC !== undefined )
        {
            this.#totalTtc.innerHTML = this.#TTC;
        }
    }
}

window.customElements.define("axial-quote-section-footer", AxialQuoteSectionFooter);
export { AxialQuoteSectionFooter }