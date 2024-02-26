"use strict"

class AxialLayerBase extends HTMLElement
{
    constructor()
    {
        super();
        this.classList.add("axial_layer_base");
    }
}

window.customElements.define("axial-layer-base", AxialLayerBase);
export { AxialLayerBase }