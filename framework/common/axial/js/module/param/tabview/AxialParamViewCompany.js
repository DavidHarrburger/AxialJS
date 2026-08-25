"use strict";

import { AxialView } from "../../../view/AxialView.js";
import { AxialCardBase } from "../../../card/AxialCardBase.js";

import { AxialCompanyParamWeekPlanning } from "../comps/company/AxialCompanyParamWeekPlanning.js";

class AxialParamViewCompany extends AxialView
{
    constructor()
    {
        super();
        this.template = "axial-param-view-company-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-param-view-company", AxialParamViewCompany);
export { AxialParamViewCompany }
