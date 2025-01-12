"use strict";

import { AxialChartBase } from "./AxialChartBase.js";

class AxialChart extends AxialChartBase
{
    /// elements
    /** @type { HTMLElement } */
    #title;
    
    /** @type { HTMLElement } */
    #action;

    /** @type { HTMLElement } */
    #area;

    constructor()
    {
        super();
        this.classList.add("axial_chart");
        this.template = "axial-chart-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#title = this.shadowRoot.getElementById("title");
        this.#action = this.shadowRoot.getElementById("action");
        this.#area = this.shadowRoot.getElementById("area");
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get title() { return this.#title; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get action() { return this.#action; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get area() { return this.#area; }

}
window.customElements.define("axial-chart", AxialChart);
export { AxialChart }