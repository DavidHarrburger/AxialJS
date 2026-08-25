"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialCounterpartBase extends AxialComponentBase
{
    /** @type { Boolean } */
    #isVisible = false;

    constructor()
    {
        super();
        this.classList.add("axial_counterpart_base");
    }

    get isVisible() { return this.#isVisible; }
    set isVisible( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#isVisible = value;
        this.style.display = this.#isVisible == true ? "block" : "none";
    }

}

window.customElements.define("axial-counterpart-base", AxialCounterpartBase);
export { AxialCounterpartBase }