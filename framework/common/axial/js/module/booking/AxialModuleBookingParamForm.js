"use strict";

import { AxialForm } from "../../forms/AxialForm.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleBookingParamForm extends AxialForm
{
    /// vars
    /** @type { String } */
    #apiBookingParamGetPath = "./api/booking/param/get";

    /** @type { String } */
    #apiBookingParamPostPath = "./api/booking/param/set";

    constructor()
    {
        super();
        this.template = "axial-module-booking-param-form-template";
        this.getPath = PathUtils.getPathFromRelative(this.#apiBookingParamGetPath);
        this.postPath = PathUtils.getPathFromRelative(this.#apiBookingParamPostPath);
    }

    _buildComponent()
    {
        super._buildComponent();
        
    }

    _onGetResponse()
    {
        console.log( this.getData )
        this._fillForm( this.getData.content );
    }

    _fillForm( object )
    {
        super._fillForm(object);
    }

    clearForm()
    {
        super.clearForm();
    }
}

window.customElements.define("axial-module-booking-param-form", AxialModuleBookingParamForm);
export { AxialModuleBookingParamForm }