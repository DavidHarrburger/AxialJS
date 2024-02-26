"use strict"

import { AxialLayerBase } from "./AxialLayerBase.js";

class AxialIntroLayer extends AxialLayerBase
{
    constructor()
    {
        super();
        this.classList.add("axial_intro_layer");
    }
}

window.customElements.define("axial-intro-layer", AxialIntroLayer);
export { AxialIntroLayer }