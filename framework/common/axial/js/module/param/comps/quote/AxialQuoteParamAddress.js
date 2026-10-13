"use strict";

import { AxialForm } from "../../../../forms/AxialForm.js";
import { PathUtils } from "../../../../utils/PathUtils.js";

class AxialQuoteParamAddress extends AxialForm
{
    /** @type { String } */
    #localGetPath = "./api/params/estimation/address/get";

    /** @type { String } */
    #localPostPath = "./api/params/estimation/address/set";

    constructor()
    {
        super();
        this.template = "axial-quote-param-address-template";

        this.#localGetPath = PathUtils.getPathFromRelative(this.#localGetPath);
        this.#localPostPath = PathUtils.getPathFromRelative(this.#localPostPath);

        this.getPath = this.#localGetPath;
        this.postPath = this.#localPostPath;
    }
}

window.customElements.define("axial-quote-param-address", AxialQuoteParamAddress);
export { AxialQuoteParamAddress }