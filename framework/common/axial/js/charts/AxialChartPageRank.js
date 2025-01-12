"use strict";

import { AxialChartBase } from "./AxialChartBase.js";
import { AxialChart } from "./AxialChart.js";
import { AxialChartElementBar } from "./AxialChartElementBar.js";
import { DomUtils } from "../utils/DomUtils.js";

class AxialChartPageRank extends AxialChart
{
    /// vars
    /** @type { Map } */
    #map;

    /** @type { Array } */
    #sorted;

    /** @type { Number } */
    #minRank = 3;

    constructor()
    {
        super();
        //this.classList.add("axial_chart");
        this.template = "axial-chart-page-rank-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    #compare( a, b )
    {
        let r = 0;
        if( a[1] > b[1] )
        {
            r = -1;
        }
        else if( a[1] < b[1] )
        {
            r = 1;
        }
        else
        {
            r = 0;
        }
        return r;
    }

    _onChartDataChanged()
    {
        super._onChartDataChanged();
        this.#map = new Map();
        for( const stat of this.chartData )
        {
            const title = stat.title;
            if( this.#map.has(title) === false )
            {
                this.#map.set( title, 1 );
            }
            else
            {
                const n = this.#map.get(title) + 1;
                this.#map.set(title, n);
            }
        }
        const mapArray = Array.from( this.#map );
        mapArray.sort( this.#compare );
        this.#sorted = mapArray;
    }

    _drawChart()
    {
        super._drawChart();
        const total = this.chartData.length;
        const max = this.#sorted[0][1];
        const min = this.#sorted[this.#minRank-1][1];
        //console.log(total, max, min);

        if( this.action ) { this.action.innerHTML = String(total); }

        for( let i = 0; i < this.#minRank; i++ )
        {
            const dataModel = this.#sorted[i];
            const bar = new AxialChartElementBar();
            if( this.area )
            {
                this.area.appendChild(bar);
            }
            const pageName = dataModel[0]
            const pageViews = dataModel[1];
            const percent = Math.round( pageViews / max * 100 );
            bar.barValue = percent;
            bar.barText = String(pageViews);
            bar.labelText = String(pageName);
        }
    }

    _clearChart()
    {
        super._clearChart();
        if( this.area )
        {
            DomUtils.cleanElement( this.area );
        }
    }
}
window.customElements.define("axial-chart-page-rank", AxialChartPageRank);
export { AxialChartPageRank }