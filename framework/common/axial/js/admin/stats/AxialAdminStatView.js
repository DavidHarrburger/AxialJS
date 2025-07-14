"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialCalendarButton } from "../../date/AxialCalendarButton.js";
import { AxialChartTraffic } from "../../charts/AxialChartTraffic.js";

class AxialAdminStatView extends AxialAdminViewBase
{
    /// vars
    /** @type { Array } */
    #stats;

    /** @type { Array } */
    #dateSortedStats;

    /** @type { Date } */
    #dateMin;

    /** @type { Date } */
    #dateMax;

    /// elements
    /** @type { AxialCalendarButton } */
    #dateStartButton;

    /** @type { AxialCalendarButton } */
    #dateEndButton;

    /// charts
    /** @type { AxialChartTraffic } */
    #trafficChart;

    /// events
    /** @type { Function } */
    #boundSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-stat-view-template";
        this.#boundSuccessHandler = this.#successHandler.bind(this);
        this.addEventListener("serviceSuccess", this.#boundSuccessHandler);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#dateStartButton = this.shadowRoot.getElementById("dateStartButton");
        this.#dateEndButton = this.shadowRoot.getElementById("dateEndButton");

        this.#trafficChart = this.shadowRoot.getElementById("trafficChart");
        
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #successHandler( event )
    {
        this.#stats = event.detail.data.content;
        this.#parseData();
    }

    #parseData()
    {
        //console.log(this.#stats);
        this.#dateSortedStats = this.#stats;
        this.#dateSortedStats.sort( this.#dateSorter );
        console.log(this.#dateSortedStats);
        this.#dateMin = new Date( this.#dateSortedStats[0].dateStart );
        this.#dateMax = new Date( this.#dateSortedStats[this.#dateSortedStats.length-1].dateStart );

        this.#trafficChart.chartData = this.#dateSortedStats;
    }

    #dateSorter( a, b )
    {
        let r = 0;
        if( a.dateStart && b.dateStart )
        {
            const ad = new Date(a.dateStart);
            const bd = new Date(b.dateStart);

            if( ad > bd )
            {
                r = 1;
            }
            else if( ad > bd )
            {
                r = -1;
            }
            else
            {
                r = 0;
            }
        }
        return r;
    }

}
window.customElements.define("axial-admin-stat-view", AxialAdminStatView);
export { AxialAdminStatView }