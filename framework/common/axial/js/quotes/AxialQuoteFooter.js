"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialQuoteFooter extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #legalPath = "./api/params/estimation/legal/get";

    /// elements
    /** @type { HTMLElement } */
    #totalHt;

    /** @type { HTMLElement } */
    #tax5;

    /** @type { HTMLElement } */
    #tax10;

    /** @type { HTMLElement } */
    #tax20;

    /** @type { HTMLElement } */
    #totalTtc;

    /** @type { HTMLElement } */
    #legal;

    constructor()
    {
        super();
        this.classList.add("axial_quote_footer");
        this.template = "axial-quote-footer-template";
        this.#legalPath = PathUtils.getPathFromRelative(this.#legalPath);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#totalHt = this.shadowRoot.getElementById("totalHt");
        this.#tax5 = this.shadowRoot.getElementById("tax5");
        this.#tax10 = this.shadowRoot.getElementById("tax10");
        this.#tax20 = this.shadowRoot.getElementById("tax20");
        this.#totalTtc = this.shadowRoot.getElementById("totalTtc");
        this.#legal = this.shadowRoot.getElementById("legal");

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
        this.#totalHt.children[1].innerHTML = Number(this.data.tht).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " €";
        this.#tax5.children[1].innerHTML = Number(this.data.t5).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " €";
        this.#tax10.children[1].innerHTML = Number(this.data.t10).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " €";
        this.#tax20.children[1].innerHTML = Number(this.data.t20).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " €";
        this.#totalTtc.children[1].innerHTML = Number(this.data.ttc).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " €";

        if( this.data.t5 === 0 )  { this.#tax5.style.display = "none"; }
        if( this.data.t10 === 0 ) { this.#tax10.style.display = "none"; }
        if( this.data.t20 === 0 ) { this.#tax20.style.display = "none"; }

        this.#fetchLegal();
    }

    async #fetchLegal()
    {
        try
        {
            const legalJson = await FetchUtils.GET(this.#legalPath);
            if( this.#legal )
            {
                this.#legal.innerHTML = legalJson.content.items[0].value[0].value;
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-quote-footer", AxialQuoteFooter);
export { AxialQuoteFooter }