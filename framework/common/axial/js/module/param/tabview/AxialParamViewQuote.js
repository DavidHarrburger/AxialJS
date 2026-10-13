"use strict";

import { AxialView } from "../../../view/AxialView.js";
import { AxialCardBase } from "../../../card/AxialCardBase.js";
import { AxialCard } from "../../../card/AxialCard.js";

import { AxialQuoteParamLegal } from "../comps/quote/AxialQuoteParamLegal.js";
import { AxialQuoteParamImage } from "../comps/quote/AxialQuoteParamImage.js";
import { AxialQuoteParamMail } from "../comps/quote/AxialQuoteParamMail.js";
import { AxialQuoteParamAddress } from "../comps/quote/AxialQuoteParamAddress.js";

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
