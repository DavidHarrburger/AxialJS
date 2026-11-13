"use strict";

import { AxialFunBase } from "./AxialFunBase.js";

class AxialFunCheck extends AxialFunBase
{
    /** @type { SVGElement } */
    #bg;

    /** @type { SVGElement } */
    #ring;

    /** @type { SVGElement } */
    #sign;

    constructor()
    {
        super();
        this.template = "axial-fun-check-template";
        this.classList.add("axial_fun_check");
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#bg = this.shadowRoot.getElementById("bg");
        this.#ring = this.shadowRoot.getElementById("ring");
        this.#sign = this.shadowRoot.getElementById("sign");
    }

    play()
    {
        this.#bg.style.animationPlayState = "running";
        this.#ring.style.animationPlayState = "running";
        this.#sign.style.animationPlayState = "running";
    }
}

window.customElements.define("axial-fun-check", AxialFunCheck);
export { AxialFunCheck }