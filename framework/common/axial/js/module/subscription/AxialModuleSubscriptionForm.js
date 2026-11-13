"use strict";

import { AxialForm } from "../../forms/AxialForm.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleSubscriptionForm extends AxialForm
{
    /** @type { String } */
    #createPath = "./api/subscription/create";

    //#updatePath = "./api/subscription/update";

    constructor()
    {
        super();
        this.template = "axial-module-subscription-form-template";
        this.#createPath = PathUtils.getPathFromRelative(this.#createPath);
        this.postPath = this.#createPath;
    }

    _buildComponent()
    {
        super._buildComponent();
        
    }
    /*
    _fillForm( object )
    {
        super._fillForm(object);
    }
    */

    clearForm()
    {
        super.clearForm();
        
    }
}

window.customElements.define("axial-module-subscription-form", AxialModuleSubscriptionForm);
export { AxialModuleSubscriptionForm }