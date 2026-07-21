"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialQuoteHeader extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_quote_header");
        this.template = "axial-quote-header-template";
    }
}

window.customElements.define("axial-quote-header", AxialQuoteHeader);
export { AxialQuoteHeader }