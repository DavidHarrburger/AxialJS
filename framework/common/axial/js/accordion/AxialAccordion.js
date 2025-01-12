"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAccordion extends AxialComponentBase
{
    constructor()
    {
        super();
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-accordion", AxialAccordion);
export { AxialAccordion }