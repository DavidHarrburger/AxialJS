"use strict"

import { AxialChart } from "./AxialChart.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialChartAverageTime extends AxialChart
{
    /** @type { Number } */
    #average = 0;

    /** @type { Number */
    #total = 0;

    constructor()
    {
        super();
        this.template = "axial-chart-average-time-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _onChartDataChanged()
    {
        super._onChartDataChanged();
        for( const stat of this.chartData )
        {
            const ds = new Date( stat.dateStart );
            const de = new Date( stat.dateEnd );
            const dt = de - ds;
            
            this.#total = this.#total + dt;
        }
        this.#average = Math.round( this.#total / this.chartData.length );
    }

    _drawChart()
    {
        super._drawChart();
        if( this.action )
        {
            this.action.innerHTML = "total : " + DateUtils.duration(this.#total);
        }
        if( this.area )
        {
            //this.area.innerHTML = String(this.#average);
            this.area.innerHTML = DateUtils.duration(this.#average);
        }
    }

    _clearChart()
    {
        super._clearChart();
    }
}
window.customElements.define("axial-chart-average-time", AxialChartAverageTime);
export { AxialChartAverageTime }