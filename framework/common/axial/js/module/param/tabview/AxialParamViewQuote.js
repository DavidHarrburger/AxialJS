"use strict";

import { AxialView } from "../../../view/AxialView.js";
import { AxialCardBase } from "../../../card/AxialCardBase.js";

import { AxialQuoteParamLegal } from "../comps/quote/AxialQuoteParamLegal.js";
import { AxialQuoteParamImage } from "../comps/quote/AxialQuoteParamImage.js";

class AxialParamViewQuote extends AxialView
{
    constructor()
    {
        super();
        this.template = "axial-param-view-quote-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-param-view-quote", AxialParamViewQuote);
export { AxialParamViewQuote }
