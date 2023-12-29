"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialSliderItemBase extends AxialComponentBase
{

    constructor()
    {
        super();
        this.classList.add("axial_slider_item_base");
        this.useResizeObserver = true;
    }
}

window.customElements.define("axial-slider-item-base", AxialSliderItemBase);
export { AxialSliderItemBase }