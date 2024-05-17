"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialFormBase extends AxialComponentBase
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-form-base", AxialFormBase);
export { AxialFormBase }