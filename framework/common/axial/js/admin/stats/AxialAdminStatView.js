"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialCalendarButton } from "../../date/AxialCalendarButton.js";
import { AxialChartTraffic } from "../../charts/AxialChartTraffic.js";
import { AxialListButton } from "../../application/AxialListButton.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminStatView extends AxialAdminViewBase
{
    /// vars
    /** @type { Set } */
    #MODES = new Set( [ "week", "month", "year", "period" ] );

    /** @type { Array } */
    #stats;

    /** @type { Array } */
    #dateSortedStats;

    /** @type { Date } */
    #dateMin;

    /** @type { Date } */
    #dateMax = new Date();

    /// elements
    /** @type { AxialCalendarButton } */
    #dateStartButton;

    /** @type { AxialCalendarButton } */
    #dateEndButton;

    /** @type { AxialListButton } */
    #listButton;

    /// charts
    /** @type { AxialChartTraffic } */
    #trafficChart;

    /// events
    /** @type { Function } */
    #boundSuccessHandler;

    /** @type { Function } */
    #boundListChangedHandler;

    /** @type { Function } */
    #boundDateStartHandler;

    /** @type { Function } */
    #boundDateEndHandler;

    /// test
    #periodValues = 
    [
        { label: "Les 7 derniers jours", value: "week" },
        { label: "Les 30 derniers jours", value: "month" },
        { label: "Les 12 derniers mois", value: "year" },
        { label: "Période personnalisée", value: "period" }
    ];

    /** @type { String } */
    #mode = "week";

    /** @type { Date } */
    #periodMin;

    /** @type { Date } */
    #periodMax;


    constructor()
    {
        super();
        this.template = "axial-admin-stat-view-template";
        this.#boundSuccessHandler = this.#successHandler.bind(this);
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);
        this.#boundDateStartHandler = this.#dateStartHandler.bind(this);
        this.#boundDateEndHandler = this.#dateEndHandler.bind(this);
        this.addEventListener("serviceSuccess", this.#boundSuccessHandler);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#dateStartButton = this.shadowRoot.getElementById("dateStartButton");
        this.#dateStartButton.addEventListener("dateChanged", this.#boundDateStartHandler);

        this.#dateEndButton = this.shadowRoot.getElementById("dateEndButton");
        this.#dateEndButton.addEventListener("dateChanged", this.#boundDateEndHandler);

        this.#listButton = this.shadowRoot.getElementById("listButton");
        this.#listButton.addEventListener("listChanged", this.#boundListChangedHandler);

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
        //console.log(this.#dateSortedStats);
        this.#dateMin = new Date( this.#dateSortedStats[0].dateStart );
        this.#dateMax = new Date( this.#dateSortedStats[this.#dateSortedStats.length-1].dateStart );

        this.#trafficChart.chartData = this.#dateSortedStats;

        // styles (fallait bien mettre ce code qq part...)
        //this.#dateStartButton.enabled = false;
        this.#dateStartButton.overlay.position = "bottom-right";
        this.#dateStartButton.calendar.min = this.#dateMin;
        this.#dateStartButton.calendar.max = this.#dateMax;

        //this.#dateEndButton.enabled = false;
        this.#dateEndButton.overlay.position = "bottom-right";
        this.#dateEndButton.calendar.min = this.#dateMin;
        this.#dateEndButton.calendar.max = this.#dateMax;

        this.#listButton.overlay.position = "bottom-right";
        this.#listButton.values = this.#periodValues;
        this.#listButton.selectedIndex = 0;

        this.#updateMode();
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
            else if( ad < bd )
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

    #listChangedHandler( event )
    {
        //console.log( event );
        const newMode = event.detail.value;
        if( this.#MODES.has( newMode ) === true )
        {
            this.#mode = newMode;
            this.#updateMode();
            if( this.#trafficChart )
            {
                this.#trafficChart.mode = this.#mode;
            }
        }
    }

    #updateMode()
    {
        
        if( this.#mode === "period" )
        {
            this.#dateStartButton.enabled = true;
            this.#dateEndButton.enabled = true;
        }
        else
        {
            this.#dateStartButton.enabled = false;
            this.#dateEndButton.enabled = false;
        }
        
        switch( this.#mode )
        {
            case "week":
                this.#dateStartButton.date = DateUtils.goToPast( new Date(), 6);
                this.#dateEndButton.date = new Date();
            break;

            case "month":
                this.#dateStartButton.date = DateUtils.goToPast( new Date(), 29);
                this.#dateEndButton.date = new Date();
            break;

            case "year":
                const d = new Date();
                const lastMonth = new Date( d.getFullYear(), d.getMonth(), 1 );
                const firstMonth = new Date( lastMonth.getFullYear(), lastMonth.getMonth()-11, 1 );
                //console.log( lastMonth );
                //console.log( firstMonth );

                this.#dateStartButton.date = firstMonth;
                this.#dateEndButton.date = d;
            break;

            case "period":
                if( this.#periodMin === undefined )
                {
                    this.#dateStartButton.date = DateUtils.goToPast( new Date(), 6);
                    this.#trafficChart.periodMin = DateUtils.goToPast( new Date(), 6);
                }
                else
                {
                    this.#dateStartButton.date = this.#periodMin;
                    this.#trafficChart.periodMin = this.#periodMin;
                }
                
                if( this.#periodMax === undefined )
                {
                    this.#dateEndButton.date = new Date();
                    this.#trafficChart.periodMax = new Date();
                }
                else
                {
                    this.#dateEndButton.date = this.#periodMax;
                    this.#trafficChart.periodMax = this.#periodMax;
                }
                
            break;

            default:
            break;
        }
    }

    #dateStartHandler( event )
    {
        //console.log( this.#dateStartButton.date );
        this.#periodMin = this.#dateStartButton.date;
        this.#trafficChart.periodMin = this.#dateStartButton.date;
    }

    #dateEndHandler( event )
    {
        //console.log( this.#dateEndButton.date );
        this.#periodMax = this.#dateEndButton.date;
        this.#trafficChart.periodMax = this.#dateEndButton.date;
    }

}
window.customElements.define("axial-admin-stat-view", AxialAdminStatView);
export { AxialAdminStatView }