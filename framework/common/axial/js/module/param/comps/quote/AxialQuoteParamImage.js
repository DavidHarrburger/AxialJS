"use strict";

import { AxialForm } from "../../../../forms/AxialForm.js";
import { PathUtils } from "../../../../utils/PathUtils.js";

class AxialQuoteParamImage extends AxialForm
{
    /** @type { String } */
    #localGetPath = "./api/params/estimation/image/get";

    /** @type { String } */
    #localPostPath = "./api/params/estimation/image/set";

    constructor()
    {
        super();
        this.template = "axial-quote-param-image-template";

        this.#localGetPath = PathUtils.getPathFromRelative(this.#localGetPath);
        this.#localPostPath = PathUtils.getPathFromRelative(this.#localPostPath);

        this.getPath = this.#localGetPath;
        this.postPath = this.#localPostPath;

    }
}

window.customElements.define("axial-quote-param-image", AxialQuoteParamImage);
export { AxialQuoteParamImage }