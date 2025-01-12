"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTooltipBase } from "../tooltip/AxialTooltipBase.js";

class AxialChartElementBar extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #bar;

    /** @type { HTMLElement } */
    #label;

    /** @type { AxialTooltipBase } */
    #tooltip;

    /// vars
    /** @type { String } */
    #labelText = "label";

    /** @type { String } */
    #barText = "";

    /** @type { Number } */
    #barValue = 100;

    constructor()
    {
        super();
        this.classList.add("axial_chart_element_bar");
        this.template = "axial-chart-element-bar-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#bar = this.shadowRoot.getElementById("bar");
        this.#label = this.shadowRoot.getElementById("label");

        if( this.#bar )
        {
            this.#bar.style.height = String( this.#barValue ) + "%";
            this.#bar.innerHTML = this.#barText;
        }

        if( this.#label )
        {
            this.#label.innerHTML = this.#labelText;
        }

        this.#tooltip = new AxialTooltipBase();
        this.#tooltip.target = this.#bar;
        this.#tooltip.position = "right-top"
        this.#tooltip.innerHTML = this.#labelText;
    }

    get barValue() { return this.#barValue; }
    set barValue( value )
    {
        if( isNaN( value ) === true )
        {
            throw new TypeError("positive Number value between 0 and 100");
        }
        if( value < 0 ) { this.#barValue = 0; }
        else if( value > 100 ) { this.#barValue = 100; }
        else { this.#barValue = value; }

        if( this.#bar )
        {
            this.#bar.style.height = String( this.#barValue ) + "%";
        }
    }

    get barText() { return this.#barText; }
    set barText( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#barText = value;
        if( this.#bar )
        {
            this.#bar.innerHTML = this.#barText;
        }
    }

    get labelText() { return this.#labelText; }
    set labelText( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#labelText = value;
        if( this.#label )
        {
            this.#label.innerHTML = this.#labelText;
        }

        if( this.#tooltip )
        {
            this.#tooltip.innerHTML = this.#labelText;
        }
    }

}
window.customElements.define("axial-chart-element-bar", AxialChartElementBar);
export { AxialChartElementBar }