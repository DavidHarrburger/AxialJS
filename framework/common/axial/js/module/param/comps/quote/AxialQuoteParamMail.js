"use strict";

import { AxialForm } from "../../../../forms/AxialForm.js";
import { PathUtils } from "../../../../utils/PathUtils.js";

class AxialQuoteParamMail extends AxialForm
{
    /** @type { String } */
    #localGetPath = "./api/params/estimation/mail/get";

    /** @type { String } */
    #localPostPath = "./api/params/estimation/mail/set";

    constructor()
    {
        super();
        this.template = "axial-quote-param-mail-template";

        this.#localGetPath = PathUtils.getPathFromRelative(this.#localGetPath);
        this.#localPostPath = PathUtils.getPathFromRelative(this.#localPostPath);

        this.getPath = this.#localGetPath;
        this.postPath = this.#localPostPath;
    }
}

window.customElements.define("axial-quote-param-mail", AxialQuoteParamMail);
export { AxialQuoteParamMail }