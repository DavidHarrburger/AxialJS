"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialQuoteHeader } from "./AxialQuoteHeader.js";
import { DomUtils } from "../utils/DomUtils.js";
import { AxialQuoteSectionHeader } from "./AxialQuoteSectionHeader.js";
import { AxialQuoteItem } from "./AxialQuoteItem.js";
import { AxialQuoteSectionFooter } from "./AxialQuoteSectionFooter.js";
import { AxialQuoteFooter } from "./AxialQuoteFooter.js";

class AxialQuote extends AxialComponentBase
{
    /// elements
    /** @type { AxialQuoteHeader } */
    #header;

    /** @type { HTMLElement } */
    #holder;

    constructor()
    {
        super();
        this.classList.add("axial_quote");
        this.template = "axial-quote-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        if( this.data !== undefined )
        {
            this.#buildQuote();
        }
    }

    _onDataChanged()
    {
        if( this.componentBuilt === true )
        {
            this.#clearQuote();
        }
    }

    #clearQuote()
    {
        DomUtils.cleanElement( this.#holder );
        if( this.data !== undefined )
        {
            this.#buildQuote();
        }
    }

    #buildQuote()
    {
        console.log("QUOTE DATA ENTRY POINT");
        console.log( this.data );
        const A = this.data;
        let N = 0;

        let T5 = 0; let T10 = 0; let T20 = 0;
        let THT = 0; let TTC = 0;

        for( const a of A )
        {
            N++;
            const sh = new AxialQuoteSectionHeader();
            sh.sectionNum = String(N);
            sh.sectionTitle = a.sectionTitle;
            this.#holder.appendChild(sh);

            const map = Array.from(a.map);
            let SN = 0;

            let ST5 = 0; let ST10 = 0; let ST20 = 0;
            let STHT = 0; let STTC = 0;
            for( const item of map )
            {
                const p = item[1];
                // exclusion
                if( p.quantity == undefined || p.quantity <= 0 ) { continue; }
                SN++;
                const itemNum = `${N}.${SN}`;

                const quoteItem = new AxialQuoteItem();
                quoteItem.itemNum = itemNum;
                quoteItem.data = p;

                // global amount calculation
                const article = p.article;
                const qty = p.quantity;
                const tax = article.tax;
                const pu = article.value;
                const atht = qty * pu;
                const tva = tax / 100 * atht;
                const attc = atht + tva;

                switch( tax )
                {
                    case 5.5: ST5 = ST5 + tva; break;
                    case 10: ST10 = ST10 + tva; break;
                    case 20: ST20 = ST20 + tva; break;
                    default: break;
                }

                // total section
                STHT = STHT + atht;
                STTC = STTC + attc;

                this.#holder.appendChild(quoteItem);
            }

            // add section footer
            const sectionFooter = new AxialQuoteSectionFooter();
            sectionFooter.sectionTitle = "Totaux " + a.sectionTitle;
            const tempTax = ST5 + ST10 + ST20; 
            sectionFooter.HT = String( STHT.toFixed(2) );
            sectionFooter.TVA = String( tempTax.toFixed(2) );
            sectionFooter.TTC = String( STTC.toFixed(2) );
            this.#holder.appendChild(sectionFooter);

            // total global
            T5 = T5 + ST5;
            T10 = T10 + ST10;
            T20 = T20 + ST20;

            THT = THT + STHT;
            TTC = TTC + STTC;
            
        }
        // add quote footer
        const quoteFooter = new AxialQuoteFooter();
        const footerData = { tht: THT, t5: T5, t10:T10, t20: T20, ttc:TTC };
        quoteFooter.data = footerData;
        this.#holder.appendChild(quoteFooter);

        // dispatch
        console.log( "THT = ", THT, " TTC = ", TTC );
    }
}

window.customElements.define("axial-quote", AxialQuote);
export { AxialQuote }