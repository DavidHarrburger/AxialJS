"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialChartBase extends AxialServiceComponentBase
{
    /** @type { Object } */
    #chartData;

    /** @type { Boolean } */
    #chartDrawn = false;
    
    /** @type { String } */
    #dateStartField = "dateStart";

    /** @type { String } */
    #dateEndField = "dateEnd";

    /** @type { Date } */
    #dateStart;

    /** @type { Date } */
    #dateEnd;

    constructor()
    {
        super();
    }

    /**
     * Get or set data of the component.
     * @public
     * @type { any }
     * @param { any } value 
     */
    get chartData() { return this.#chartData; }
    set chartData( value )
    {
        if( this.#chartData == value ) { return; }
        this.#chartData = value;
        this.#onChartDataChanged();
        const chartDataChangedEvent = new CustomEvent("chartDataChanged");
        this.dispatchEvent(chartDataChangedEvent);
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    #onChartDataChanged()
    {
        if( this._onChartDataChanged )
        {
            this._onChartDataChanged();
        }
        
        this.#drawChart()
    }

    _onChartDataChanged() {}

    #clearChart()
    {
        if( this._clearChart )
        {
            this._clearChart();
        }
    }

    _clearChart() {}

    #drawChart()
    {
        if( this.#chartDrawn === true )
        {
            this.#clearChart();
        }

        if( this._drawChart )
        {
            this._drawChart();
        }

        this.#chartDrawn = true;

        const chartDrawnEvent = new CustomEvent("chartDrawn");
        this.dispatchEvent(chartDrawnEvent);
    }

    _drawChart() {}
}
window.customElements.define("axial-chart-base", AxialChartBase);
export { AxialChartBase }