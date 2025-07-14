"use strict";

import { AxialChart } from "./AxialChart.js";
import { DomUtils } from "../utils/DomUtils.js";
import { DateUtils } from "../utils/DateUtils.js";
import { Point } from "../geom/Point.js";
class AxialChartTraffic extends AxialChart
{
    /// vars
    /** @type { Number } */
    #wi = 0;

    /** @type { Number } */
    #hi = 0;

    /** @type { Map } */
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

    /// temp
    /** @type { Number } */
    #columns = 7;

    /** @type { Array } */
    #points;

    /// elements
    /** @type { SVGElement } */
    #svg;

    /** @type { HTMLElement } */
    #axisX;

    /** @type { HTMLElement } */
    #axisY;



    constructor()
    {
        super();
        this.template = "axial-chart-traffic-template";
        this.#dateLast = new Date();
        this.#dateFirst = new Date( this.#dateLast.getFullYear(), this.#dateLast.getMonth(), this.#dateLast.getDate() - 6 );

        this.useResizeObserver = true;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#axisX = this.shadowRoot.getElementById("axisX");
        this.#axisY = this.shadowRoot.getElementById("axisY");
    }

    _onChartDataChanged()
    {
        super._onChartDataChanged();
        
        this.#map = new Map();
        let mapDate = this.#dateFirst;
        for( let i = 0; i < 7; i ++ )
        {
            this.#map.set( mapDate.getTime(), 0 );
            mapDate = DateUtils.nextDay(mapDate);
        }

        for( const stat of this.chartData )
        {
            const statDate = new Date( stat.dateStart );
            const mapStatDate = new Date( statDate.getFullYear(), statDate.getMonth(), statDate.getDate() ).getTime();
            //console.log( mapStatDate );
            //console.log( this.#map.has(mapStatDate.getTime()));
            if( this.#map.has( mapStatDate ) === true )
            {
                const value = this.#map.get( mapStatDate ) + 1;
                this.#map.set( mapStatDate, value );
                if( value > this.#maxValue ) { this.#maxValue = value; }
            }
        }
        console.log(this.#map);
        console.log(this.#maxValue);
    }

    _drawChart()
    {
        super._drawChart();

        this.#points = new Array();

        this.#wi = this.area.offsetWidth;
        this.#hi = this.area.offsetHeight;

        const mapArray = Array.from(this.#map);
        const stepWidth = this.#wi / 7;

        // calculate maximum Y
        const smax = String(this.#maxValue);
        const lmax = smax.length;
        const fmax = Number(smax.substring(0,1)) + 1;
        let tmax = String(fmax);
        for( let i = 0; i < lmax-1; i++ )
        {
            tmax = tmax + "0";
        }
        const maxY = Number(tmax);

        // axis y lines
        const yMaxLine = document.createElement("div");
        yMaxLine.classList.add("axial_chart_traffic-yline");
        yMaxLine.style.top = "1px";
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
        yMediumNum.innerHTML = Math.round(maxY / 2);
        this.#axisY.appendChild(yMediumNum);


        for( let i = 0; i < 7; i++ )
        {
            // axis X
            const stepX = document.createElement("div");
            stepX.classList.add("axial_chart-step_x");
            stepX.innerHTML = DateUtils.format( new Date( mapArray[i][0] ) );
            this.#axisX.appendChild( stepX );

            // points
            const pointX = stepWidth * i + (stepWidth / 2);
            const pointY = mapArray[i][1] / maxY * this.#hi;
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
            trafficNum.innerHTML = mapArray[i][1]
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
        console.log( "traffic chart resize" );

        this.#wi = this.area.offsetWidth;
        this.#hi = this.area.offsetHeight;
        console.log("traffic chart", this.#wi, this.#hi);

        const mapArray = Array.from(this.#map);
        const stepWidth = this.#wi / 7;

        // calculate maximum Y
        const smax = String(this.#maxValue);
        const lmax = smax.length;
        const fmax = Number(smax.substring(0,1)) + 1;
        let tmax = String(fmax);
        for( let i = 0; i < lmax-1; i++ )
        {
            tmax = tmax + "0";
        }
        const maxY = Number(tmax);

        const lines = this.area.getElementsByClassName("axial_chart_traffic-line");
        const trafficPoints = this.area.getElementsByClassName("axial_chart_traffic-point");
        const trafficNums = this.area.getElementsByClassName("axial_chart_traffic-num");

        for( let i = 0; i < 7; i++ )
        {
            // axis X
            const stepX = this.#axisX.children[i];
            // -> display none or flex ? check flex

            // points
            const point = this.#points[i];
            point.x = stepWidth * i + (stepWidth / 2);
            point.y = mapArray[i][1] / maxY * this.#hi;

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