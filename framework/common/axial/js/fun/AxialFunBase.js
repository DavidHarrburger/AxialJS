"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialFunBase extends AxialComponentBase
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-fun-base", AxialFunBase);
export { AxialFunBase }