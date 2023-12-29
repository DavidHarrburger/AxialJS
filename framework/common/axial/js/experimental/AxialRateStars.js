"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialRateStars extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_rate_stars");
        this.template = "axial-rate-stars-template";
    }
}
window.customElements.define("axial-rate-stars", AxialRateStars);
export { AxialRateStars }