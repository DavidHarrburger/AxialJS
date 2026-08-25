"use strict";

import { AxialForm } from "../../../../forms/AxialForm.js";
import { PathUtils } from "../../../../utils/PathUtils.js";

class AxialQuoteParamLegal extends AxialForm
{
    /** @type { String } */
    #localGetPath = "./api/params/estimation/legal/get";

    /** @type { String } */
    #localPostPath = "./api/params/estimation/legal/set";

    constructor()
    {
        super();
        this.template = "axial-quote-param-legal-template";

        this.#localGetPath = PathUtils.getPathFromRelative(this.#localGetPath);
        this.#localPostPath = PathUtils.getPathFromRelative(this.#localPostPath);

        this.getPath = this.#localGetPath;
        this.postPath = this.#localPostPath;
    }
}

window.customElements.define("axial-quote-param-legal", AxialQuoteParamLegal);
export { AxialQuoteParamLegal }