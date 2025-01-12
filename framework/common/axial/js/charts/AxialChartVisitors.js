"use strict";

import { AxialChart } from "./AxialChart.js";

class AxialChartVisitors extends AxialChart
{
    /// vars
    /** @type { Number } */
    #wi = 0;

    /** @type { Number } */
    #hi = 0;

    /** @type { Map } */
    #map;

    /// elements
    /** @type { SVGElement } */
    #svg;

    constructor()
    {
        super();
        this.template = "axial-chart-visitors-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _onChartDataChanged()
    {
        super._onChartDataChanged();
        this.#map = new Map();
        for( const stat of this.chartData )
        {
            const ip = stat.ip;
            if( this.#map.has(ip) === false )
            {
                this.#map.set( ip, 1 );
            }
            else
            {
                const n = this.#map.get(ip) + 1;
                this.#map.set(ip, n);
            }
        }
    }

    _drawChart()
    {
        super._drawChart();

        this.#wi = this.area.offsetWidth;
        this.#hi = this.area.offsetHeight;

        const cx = this.#wi / 2;
        const cy = this.#hi / 2;
        const r = Math.min( this.#wi, this.#hi ) / 2 - 20;

        const total = this.#map.size;
        let returning = 0;
        for( const mapItem of this.#map )
        {
            console.log("mapItem[1] = " + mapItem[1]);
            const visits = mapItem[1];
            if( visits > 1 )
            {
                returning++;
            }
        }

        const percentReturning = Math.round( returning / total * 100 );
        console.log(percentReturning);
        
        if( this.action )
        {
            this.action.innerHTML = String(total) + " visiteurs uniques";
        }

        this.#svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.#svg.setAttribute("width", this.#wi);
        this.#svg.setAttribute("height", this.#hi);
        const box = "0 0 " + String(this.#wi) + " " + String(this.#hi);
        this.#svg.setAttribute("viewBox", box);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let coords = "M " + cx + " " + cy + " ";
        coords += "L " + cx + " " + (cy + r) + " ";
        coords += "A " + r + " " + r + " 0 0 1 " + (cx-r) + " " + cy + " ";
        coords += "Z";
        console.log(coords);
        path.setAttribute("d", coords);
        path.setAttribute("stroke", "#000");

        if( this.area )
        {
            this.area.appendChild(this.#svg);
            //this.#svg.appendChild(circle);
            this.#svg.appendChild(path);
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
window.customElements.define("axial-chart-visitors", AxialChartVisitors);
export { AxialChartVisitors }