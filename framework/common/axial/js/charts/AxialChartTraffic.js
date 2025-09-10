"use strict";

import { AxialChart } from "./AxialChart.js";
import { DomUtils } from "../utils/DomUtils.js";
import { DateUtils } from "../utils/DateUtils.js";
import { Point } from "../geom/Point.js";
class AxialChartTraffic extends AxialChart
{
    /// vars
    /** @type { Set } */
    #MODES = new Set( [ "week", "month", "year", "period" ] );
    
    /** @type { String } */
    #mode = "week";

    /** @type { Set } */
    #STYLES = new Set( [ "line", "bar" ] );

    /** @type { String } */
    #style = "week";

    /** @type { Number } */
    #wi = 0;

    /** @type { Number } */
    #hi = 0;

    /** @type { Array } */
    #map;

    /** @type { Date } */
    #date = new Date();

    /** @type { Date } */
    #dateLast;

    /** @type { Date } */
    #dateFirst;

    /** @type { Number } */
    #minValue = 0;

    /** @type { Number } */
    #maxValue = 0;

    /** @type { Number } */
    #axisSize = 40;

    /** @type { Number } */
    #maxY = 0;

    /** @type { Number } */
    #sections = 7;

    /** @type { Number } */
    #sectionMinSize = 40;

    /** @type { Number } */
    #currentSectionSize = 40;

    /** @type { Array } */
    #points;

    /** @type { Date } */
    #periodMin;

    /** @type { Date } */
    #periodMax;

    /// elements
    /** @type { SVGElement } */
    #svg;

    /** @type { HTMLElement } */
    #axisX;

    /** @type { HTMLElement } */
    #axisY;

    /** @type { HTMLElement } */
    #scroll;

    constructor()
    {
        super();
        this.template = "axial-chart-traffic-template";

        // default mode === "week"
        this.#dateLast = new Date();
        this.#dateFirst = DateUtils.goToPast(this.#dateLast, 6);

        //this.useResizeObserver = true;
    }

    get mode() { return this.#mode; }
    set mode( value )
    {
        if( this.#MODES.has(value) === false )
        {
            throw new Error("Wrong mode value : week, month, year or period");
        }
        if( this.#mode === value ) { return; }
        this.#mode = value;
        this._clearChart();
        this.#createMap();
        this._drawChart();
    }

    get periodMin() { return this.#periodMin; }
    set periodMin( value )
    {
        this.#periodMin = value;
        this.#checkPeriod();
    }

    get periodMax() { return this.#periodMax; }
    set periodMax( value )
    {
        this.#periodMax = value;
        this.#checkPeriod();
    }

    #checkPeriod()
    {
        console.log( "checkperiod", this.#mode );
        if( this.#mode !== "period" ) { return; }
        this._clearChart();
        this.#createMap();
        this._drawChart();
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#axisX = this.shadowRoot.getElementById("axisX");
        this.#axisY = this.shadowRoot.getElementById("axisY");
        this.#scroll = this.shadowRoot.getElementById("scroll");
    }

    _onChartDataChanged()
    {
        super._onChartDataChanged();
        this.#createMap();
    }

    async #createMap()
    {
        //console.log(this.chartData);
        this.#maxValue = 0;

        switch( this.#mode )
        {
            case "week":
                this.#sections = 7;
                this.#dateLast = new Date();
                this.#dateFirst = DateUtils.goToPast(this.#dateLast, 6);
            break;
            
            case "month":
                this.#sections = 30;
                this.#dateLast = new Date();
                this.#dateFirst = DateUtils.goToPast(this.#dateLast, 29);
            break;

            case "year":
                this.#sections = 12;
                const d = new Date();
                const lastMonth = new Date( d.getFullYear(), d.getMonth(), 1 );
                const firstMonth = new Date( lastMonth.getFullYear(), lastMonth.getMonth()-11, 1 );

                this.#dateLast = d;
                this.#dateFirst = firstMonth;
            break;

            case "period":
                //console.log(this.#periodMin, this.#periodMax);
                const delta = ( this.#periodMax.getTime() - this.#periodMin.getTime() ) / (1000 * 60 * 60 * 24 );
                //console.log( delta );
                this.#sections = Math.floor(delta + 1);
                this.#dateLast = this.#periodMax;
                this.#dateFirst = this.#periodMin;
            break;

            default:
            break;
        }

        this.#map = new Array( this.#sections );
        for( let i = 0; i < this.#sections; i++ )
        {
            this.#map[i] = 0
            const cd = DateUtils.goToFuture( this.#dateFirst, i );
            const cm = DateUtils.getNextMonth( this.#dateFirst, i ); // bof bof

            for( const stat of this.chartData )
            {
                const sd = DateUtils.midnight(new Date(stat.dateStart));
                //console.log(sd);
                if( this.#mode === "year" )
                {
                    if( cm.getFullYear() === sd.getFullYear() &&  cm.getMonth() === sd.getMonth() )
                    {
                        this.#map[i] = this.#map[i] + 1;
                    }
                }
                else
                {
                    if( cd.getTime() === sd.getTime() )
                    {
                        this.#map[i] = this.#map[i] + 1;
                    }
                }

                if( this.#map[i] !== undefined && this.#map[i] > this.#maxValue )
                {
                    this.#maxValue = this.#map[i];
                }
            }
        }
        console.log(this.#map);
        console.log( this.#maxValue );
    }

    _drawChart()
    {
        super._drawChart();

        this.#drawAxis();
        this.#drawArea();
    }

    #drawAxis()
    {
        this.#wi = this.#scroll.offsetWidth;

        const tempSectionSize = this.#wi / this.#sections;
        this.#currentSectionSize = tempSectionSize < this.#sectionMinSize ? this.#sectionMinSize : tempSectionSize;

        this.area.style.width = (this.#sections * this.#currentSectionSize) + "px";
        this.#axisX.style.width = (this.#sections * this.#currentSectionSize) + "px";

        for( let i = 0; i < this.#sections; i++ )
        {
            // axis X
            const stepX = document.createElement("div");
            stepX.classList.add("axial_chart-step_x");
            stepX.style.width = this.#currentSectionSize + "px";
            stepX.style.left = (this.#currentSectionSize * i) + "px";
            if( this.#mode === "year" )
            {
                const currentMonth = DateUtils.getNextMonth(this.#dateFirst, i);
                const year = currentMonth.getFullYear();
                const month = DateUtils.getMonthName(currentMonth.getMonth()).substring(0,3);
                stepX.innerHTML = `${month}. ${year}`;
            }
            else
            {
                const currentDate = DateUtils.goToFuture(this.#dateFirst, i)
                stepX.innerHTML = `${currentDate.getDate()}.${currentDate.getMonth()+1}`;
            }
            this.#axisX.appendChild( stepX );
        }

        this.#hi = this.area.offsetHeight;
        //console.log(this.#hi);

        // calculate maximum Y
        const smax = String(this.#maxValue);
        const lmax = smax.length;
        const fmax = Number(smax.substring(0,1)) + 1;
        let tmax = String(fmax);
        for( let i = 0; i < lmax-1; i++ )
        {
            tmax = tmax + "0";
        }
        this.#maxY = Number(tmax);

        // axis y lines
        const yMaxLine = document.createElement("div");
        yMaxLine.classList.add("axial_chart_traffic-yline");
        yMaxLine.style.top = "0";
        yMaxLine.style.left = "0";
        this.area.appendChild(yMaxLine);

        const yMediumLine = document.createElement("div");
        yMediumLine.classList.add("axial_chart_traffic-yline");
        yMediumLine.style.top = "50%";
        yMediumLine.style.left = "0";
        this.area.appendChild(yMediumLine);

        const yMaxNum = document.createElement("div");
        yMaxNum.classList.add("axial_chart_traffic-ynum");
        yMaxNum.style.top = "0";
        yMaxNum.style.left = "4px";
        yMaxNum.innerHTML = tmax;
        this.#axisY.appendChild(yMaxNum);

        const yMediumNum = document.createElement("div");
        yMediumNum.classList.add("axial_chart_traffic-ynum");
        yMediumNum.style.top = "calc(50% - 20px)";
        yMediumNum.style.left = "4px";
        yMediumNum.innerHTML = Math.round(this.#maxY / 2);
        this.#axisY.appendChild(yMediumNum);
    }

    #drawArea()
    {
        this.#points = new Array();
        for( let i = 0; i < this.#sections; i++ )
        {
            // points
            const pointX = this.#currentSectionSize * i + (this.#currentSectionSize / 2);
            const pointY = this.#map[i] / this.#maxY * this.#hi;
            const point = new Point( pointX, pointY);
            this.#points.push(point);

            // lines elements
            if( i > 0 )
            {
                const p1 = this.#points[i-1];
                const p2 = this.#points[i];
                const angle = -Point.angleDegrees(p1, p2);
                const dist = Point.distance(p1, p2);

                const trafficLine = document.createElement("div");
                trafficLine.classList.add("axial_chart_traffic-line");
                trafficLine.style.width = `${dist}px`;
                trafficLine.style.left = `${p1.x}px`;
                trafficLine.style.bottom = `${p1.y}px`;
                trafficLine.style.rotate = `${angle}deg`;
                this.area.appendChild(trafficLine);
            }

            // points elements
            const trafficPoint = document.createElement("div");
            trafficPoint.classList.add("axial_chart_traffic-point");
            trafficPoint.style.left = `${pointX}px`;
            trafficPoint.style.bottom = `${pointY}px`;
            this.area.appendChild(trafficPoint);

            // points elements
            const trafficNum = document.createElement("div");
            trafficNum.classList.add("axial_chart_traffic-num");
            trafficNum.style.left = `${pointX}px`;
            trafficNum.style.bottom = `${pointY}px`;
            trafficNum.innerHTML = this.#map[i]
            this.area.appendChild(trafficNum);
        }
    }

    _clearChart()
    {
        super._clearChart();
        if( this.area )
        {
            DomUtils.cleanElement( this.area );
        }
        if( this.#axisX )
        {
            DomUtils.cleanElement( this.#axisX );
        }
    }

    _observerResize( entries, observer )
    {
        super._observerResize( entries, observer );
        if( this.chartDrawn === false ) { return; }

        this.#wi = this.#scroll.offsetWidth;
        this.#hi = this.area.offsetHeight;

        const tempSectionSize = this.#wi / this.#sections;
        this.#currentSectionSize = tempSectionSize < this.#sectionMinSize ? this.#sectionMinSize : tempSectionSize;
        
        this.area.style.width = (this.#sections * this.#currentSectionSize) + "px";
        this.#axisX.style.width = (this.#sections * this.#currentSectionSize) + "px";

        // calculate maximum Y
        const smax = String(this.#maxValue);
        const lmax = smax.length;
        const fmax = Number(smax.substring(0,1)) + 1;
        let tmax = String(fmax);
        for( let i = 0; i < lmax-1; i++ )
        {
            tmax = tmax + "0";
        }
        this.#maxY = Number(tmax);

        const lines = this.area.getElementsByClassName("axial_chart_traffic-line");
        const trafficPoints = this.area.getElementsByClassName("axial_chart_traffic-point");
        const trafficNums = this.area.getElementsByClassName("axial_chart_traffic-num");

        for( let i = 0; i < this.#sections; i++ )
        {
            // axis X
            const stepX = this.#axisX.children[i];
            stepX.style.width = this.#currentSectionSize + "px";
            stepX.style.left = (this.#currentSectionSize * i) + "px";

            // points
            const point = this.#points[i];
            point.x = this.#currentSectionSize * i + (this.#currentSectionSize / 2);
            point.y = this.#map[i] / this.#maxY * this.#hi;

            // lines elements
            if( i > 0 )
            {
                const p1 = this.#points[i-1];
                const p2 = this.#points[i];
                const angle = -Point.angleDegrees(p1, p2);
                const dist = Point.distance(p1, p2);

                const trafficLine = lines[i-1];
                trafficLine.style.width = `${dist}px`;
                trafficLine.style.left = `${p1.x}px`;
                trafficLine.style.bottom = `${p1.y}px`;
                trafficLine.style.rotate = `${angle}deg`;
            }

            // points elements            
            const trafficPoint = trafficPoints[i];
            trafficPoint.style.left = `${point.x}px`;
            trafficPoint.style.bottom = `${point.y}px`;

            // num elements
            const trafficNum = trafficNums[i];
            trafficNum.style.left = `${point.x}px`;
            trafficNum.style.bottom = `${point.y}px`;
        }

    }
}
window.customElements.define("axial-chart-traffic", AxialChartTraffic);
export { AxialChartTraffic }