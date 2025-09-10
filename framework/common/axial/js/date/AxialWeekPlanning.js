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
    }

    getAsArray()
    {
        let a = new Array( [], [], [], [], [], [], [] );
        for( const input of this.#inputs )
        {
            const css = input.classList.value.split(" ")[1];
            const cssArray = css.split("-");
            
            const arrayIndex = Number( cssArray[1] ) - 1;
            let valueIndex = -1;
            switch( cssArray[0] )
            {
                case "awp_morning_start":
                    valueIndex = 0;
                break;

                case "awp_morning_end":
                    valueIndex = 1;
                break;

                case "awp_noon_start":
                    valueIndex = 2;
                break;

                case "awp_noon_end":
                    valueIndex = 3;
                break;

                default:
                break;
            }
            
            a[arrayIndex][valueIndex] = input.value;
        }
        console.log(a);
        return a;
    }

    setFromArray( a )
    {
        console.log(a);
        for( const input of this.#inputs )
        {
            const css = input.classList.value.split(" ")[1];
            const cssArray = css.split("-");
            
            const arrayIndex = Number( cssArray[1] ) - 1;
            let valueIndex = -1;
            switch( cssArray[0] )
            {
                case "awp_morning_start":
                    valueIndex = 0;
                break;

                case "awp_morning_end":
                    valueIndex = 1;
                break;

                case "awp_noon_start":
                    valueIndex = 2;
                break;

                case "awp_noon_end":
                    valueIndex = 3;
                break;

                default:
                break;
            }
            
            input.value = a[arrayIndex][valueIndex];
        }
        this.#updateInputs();
    }

    #updateInputs()
    {
        for( let i = 0; i < 7; i++ )
        {
            const index = String( i + 1 );

            // morning
            const mStartCss = "awp_morning_start-" + index;
            const mEndCss = "awp_morning_end-" + index;
            const mSubtotalCss = "awp_morning_subtotal-" + index;

            const mstart = this.#grid.getElementsByClassName(mStartCss)[0];
            const mend = this.#grid.getElementsByClassName(mEndCss)[0];
            const msubtotal = this.#grid.getElementsByClassName(mSubtotalCss)[0];

            const mtimeStart = mstart.value.split(":");
            const mtimeEnd = mend.value.split(":");

            const mdateStart = new Date(0, 0, 0, Number( mtimeStart[0] ), Number( mtimeStart[1] ), 0 );
            const mdateEnd = new Date(0, 0, 0, Number( mtimeEnd[0] ), Number( mtimeEnd[1] ), 0 );

            const mdelta = mdateEnd.getTime() - mdateStart.getTime();
            const mhours = Math.floor( mdelta / 1000 / 60 / 60 );
            const mminutes = (mdelta - (mhours * 1000 * 60 * 60) ) / 1000 / 60;

            const mresult = (String(mhours).length === 1 ? "0" + mhours : mhours) + ":" + (String(mminutes).length === 1 ? "0" + mminutes : mminutes);
            msubtotal.innerHTML = mresult;

            // noon
            const nStartCss = "awp_noon_start-" + index;
            const nEndCss = "awp_noon_end-" + index;
            const nSubtotalCss = "awp_noon_subtotal-" + index;

            const nstart = this.#grid.getElementsByClassName(nStartCss)[0];
            const nend = this.#grid.getElementsByClassName(nEndCss)[0];
            const nsubtotal = this.#grid.getElementsByClassName(nSubtotalCss)[0];

            const ntimeStart = nstart.value.split(":");
            const ntimeEnd = nend.value.split(":");

            const ndateStart = new Date(0, 0, 0, Number( ntimeStart[0] ), Number( ntimeStart[1] ), 0 );
            const ndateEnd = new Date(0, 0, 0, Number( ntimeEnd[0] ), Number( ntimeEnd[1] ), 0 );

            const ndelta = ndateEnd.getTime() - ndateStart.getTime();
            const nhours = Math.floor( ndelta / 1000 / 60 / 60 );
            const nminutes = (ndelta - (nhours * 1000 * 60 * 60) ) / 1000 / 60;

            const nresult = (String(nhours).length === 1 ? "0" + nhours : nhours) + ":" + (String(nminutes).length === 1 ? "0" + nminutes : nminutes);
            nsubtotal.innerHTML = nresult;
        }

        this.#calculateTotal();
    }

}
window.customElements.define("axial-week-planning", AxialWeekPlanning);
export { AxialWeekPlanning }