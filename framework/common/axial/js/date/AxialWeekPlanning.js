"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialWeekPlanning extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #grid;

    /** @type { Array.<HTMLInputElement> } */
    #inputs;

    /** @type { Array.<HTMLElement> } */
    #subtotals;

    /** @type { HTMLElement } */
    #totalMorning;

    /** @type { HTMLElement } */
    #totalNoon;

    /** @type { HTMLElement } */
    #totalWeek;

    /// events
    /** @type { Function } */
    #boundTimeChangeHandler;

    constructor()
    {
        super();
        this.classList.add("axial_week_planning")
        this.template = "axial-week-planning-template";
        this.#boundTimeChangeHandler = this.#timeChangedHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#grid = this.shadowRoot.getElementById("grid");
        this.#totalMorning = this.shadowRoot.getElementById("totalMorning");
        this.#totalNoon = this.shadowRoot.getElementById("totalNoon");
        this.#totalWeek = this.shadowRoot.getElementById("totalWeek");

        this.#inputs = Array.from( this.#grid.getElementsByTagName("input") );
        for( const input of this.#inputs )
        {
            input.addEventListener("change", this.#boundTimeChangeHandler);
        }

        this.#subtotals = Array.from( this.#grid.getElementsByClassName("awp_subtotal") );
    }

    #timeChangedHandler( event )
    {
        const input = event.target;
        const css = event.target.classList.value.split(" ")[1];

        let start;
        let end;
        let subtotal;

        if( css.indexOf( "start" ) > 0 )
        {
            start = input;
            end = this.#grid.getElementsByClassName( css.replace("start", "end") )[0];
            subtotal = this.#grid.getElementsByClassName( css.replace("start", "subtotal") )[0];
        }
        else
        {
            end = input;
            start = this.#grid.getElementsByClassName( css.replace("end", "start") )[0];
            subtotal = this.#grid.getElementsByClassName( css.replace("end", "subtotal") )[0];
        }

        const timeStart = start.value.split(":");
        const timeEnd = end.value.split(":");

        const dateStart = new Date(0, 0, 0, Number( timeStart[0] ), Number( timeStart[1] ), 0 );
        const dateEnd = new Date(0, 0, 0, Number( timeEnd[0] ), Number( timeEnd[1] ), 0 );

        const delta = dateEnd.getTime() - dateStart.getTime();
        const hours = Math.floor( delta / 1000 / 60 / 60 );
        const minutes = (delta - (hours * 1000 * 60 * 60) ) / 1000 / 60;

        const result = (String(hours).length === 1 ? "0" + hours : hours) + ":" + (String(minutes).length === 1 ? "0" + minutes : minutes);
        subtotal.innerHTML = result;

        this.#calculateTotal();
    }

    #calculateTotal()
    {
        let totalMorningHours = 0;
        let totalMorningMinutes = 0;

        let totalNoonHours = 0;
        let totalNoonMinutes = 0;

        let totalHours = 0;
        let totalMinutes = 0;
        
        for( const st of this.#subtotals )
        {
            const css = st.classList.value.split(" ")[1];
            const v = st.innerHTML.split(":");
            if( css.indexOf( "morning" ) > 0 )
            {
                totalMorningHours = totalMorningHours + Number(v[0]);
                totalMorningMinutes = totalMorningMinutes + Number(v[1]);
            }
            else
            {
                totalNoonHours = totalNoonHours + Number(v[0]);
                totalNoonMinutes = totalNoonMinutes + Number(v[1]);
            }
        }
        console.log("morning : ", totalMorningHours, ":", totalMorningMinutes);
        console.log("noon : ", totalNoonHours, ":", totalNoonMinutes);

        totalMorningHours = totalMorningHours + Math.floor( totalMorningMinutes / 60 );
        totalMorningMinutes = (totalMorningMinutes % 60);

        totalNoonHours = totalNoonHours + Math.floor( totalNoonMinutes / 60 );
        totalNoonMinutes = (totalNoonMinutes % 60);

        totalHours = totalMorningHours + totalNoonHours;
        totalMinutes = totalMorningMinutes + totalNoonMinutes;

        totalHours = totalHours + Math.floor( totalMinutes / 60 );
        totalMinutes = (totalMinutes % 60);

        const resultMorning = (String(totalMorningHours).length === 1 ? "0" + totalMorningHours : totalMorningHours) + ":" + (String(totalMorningMinutes).length === 1 ? "0" + totalMorningMinutes : totalMorningMinutes);
        const resultNoon = (String(totalNoonHours).length === 1 ? "0" + totalNoonHours : totalNoonHours) + ":" + (String(totalNoonMinutes).length === 1 ? "0" + totalNoonMinutes : totalNoonMinutes);
        const resultWeek = (String(totalHours).length === 1 ? "0" + totalHours : totalHours) + ":" + (String(totalMinutes).length === 1 ? "0" + totalMinutes : totalMinutes);

        this.#totalMorning.innerHTML = resultMorning;
        this.#totalNoon.innerHTML = resultNoon;
        this.#totalWeek.innerHTML = resultWeek;

        const test = this.getAsArray();
    }

    getAsArray()
    {
        let a = new Array();
        for( const input of this.#inputs )
        {
            const css = input.classList.value.split(" ")[1];
            console.log(css);
            const arrayIndex = Number( css.split("-")[1] );
            let valueIndex = -1;

            
        }
        return a;
    }

    setFromArray( a )
    {
        console.log(a);
    }

}
window.customElements.define("axial-week-planning", AxialWeekPlanning);
export { AxialWeekPlanning }