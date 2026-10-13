"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialQuote } from "../../quotes/AxialQuote.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleQuotePopup extends AxialModulePopup
{
    /** @type { AxialQuote } */
    #quote;

    constructor()
    {
        super();
        this.template = "axial-module-quote-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#quote = this.shadowRoot.getElementById("quote");
    }

    _onDataChanged()
    {
        this.title = this.data.simulation_name;
        this.#computeQuote(); // compute from simulators
    }

    #computeQuote()
    {

        let finalQuoteMap = new Array();
        const savedData = this.data.data;
        for( const step of savedData )
        {
            if( step.map != undefined )
            {
                const array = step.map;
                const map = new Map();
                for( const obj of array )
                {
                    map.set( obj.name, obj.value );
                }
                finalQuoteMap.push({ sectionTitle: step.title, map: map });
            }
        }
        this.#quote.data = finalQuoteMap;
    }

}

window.customElements.define("axial-module-quote-popup", AxialModuleQuotePopup);
export { AxialModuleQuotePopup }