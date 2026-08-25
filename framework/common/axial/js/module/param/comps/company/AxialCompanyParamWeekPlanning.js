"use strict";

import { AxialForm } from "../../../../forms/AxialForm.js";
import { PathUtils } from "../../../../utils/PathUtils.js";

class AxialCompanyParamWeekPlanning extends AxialForm
{
    /** @type { String } */
    #localGetPath = "./api/params/company/timeshift/get";

    /** @type { String } */
    #localPostPath = "./api/params/company/timeshift/set";

    constructor()
    {
        super();
        this.template = "axial-company-param-week-planning-template";

        this.#localGetPath = PathUtils.getPathFromRelative(this.#localGetPath);
        this.#localPostPath = PathUtils.getPathFromRelative(this.#localPostPath);

        this.getPath = this.#localGetPath;
        this.postPath = this.#localPostPath;

    }
}

window.customElements.define("axial-company-param-week-planning", AxialCompanyParamWeekPlanning);
export { AxialCompanyParamWeekPlanning }