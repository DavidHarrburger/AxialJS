"use strict";

import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";
import { AxialToggleCheck } from "../button/AxialToggleCheck.js";
import { AxialToggleRadio } from "../button/AxialToggleRadio.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialWeekPlanning extends AxialComponentBase
{
    /// elements
    
    /// half
    /** @type { HTMLElement } */
    #gridHalf;

    /** @type { Array.<HTMLInputElement> } */
    #inputsHalf;

    /** @type { Array.<HTMLElement> } */
    #subtotalsHalf;

    /** @type { HTMLElement } */
    #totalMorning;

    /** @type { HTMLElement } */
    #totalNoon;

    /** @type { HTMLElement } */
    #totalWeek;

    /** @type { Array.<AxialToggleCheck>} */
    #checksHalf;

    /** @type { Function } */
    #boundCheckHalfHandler;

    /** @type { Function } */
    #boundTimeHalfHandler;

    /// full
    /** @type { HTMLElement } */
    #gridFull;

    /** @type { Array.<HTMLInputElement> } */
    #inputsFull;

    /** @type { Array.<HTMLElement> } */
    #subtotalsFull;

    /** @type { HTMLElement } */
    #fullTotalWeek;

    /** @type { Array.<AxialToggleCheck>} */
    #checksFull;

    /** @type { Function } */
    #boundCheckFullHandler;

    /** @type { Function } */
    #boundTimeFullHandler;

    /// radio
    /** @type { AxialToggleButtonGroup } */
    #modeGroup;

    /** @type { Function } */
    #boundModeHandler;

    constructor()
    {
        super();
        this.classList.add("axial_week_planning")
        this.template = "axial-week-planning-template";

        this.#boundTimeHalfHandler = this.#timeHalfHandler.bind(this);
        this.#boundCheckHalfHandler = this.#checksHalfHandler.bind(this);

        this.#boundTimeFullHandler = this.#timeFullHandler.bind(this);
        this.#boundCheckFullHandler = this.#checksFullHandler.bind(this);

        this.#boundModeHandler = this.#modeHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        /// half part
        this.#gridHalf = this.shadowRoot.getElementById("gridHalf");
        this.#checksHalf = Array.from( this.#gridHalf.getElementsByTagName( "axial-toggle-check" ) );
        for( const check of this.#checksHalf )
        {
            check.addEventListener("toggleChanged", this.#boundCheckHalfHandler);
        }
        
        this.#totalMorning = this.shadowRoot.getElementById("totalMorning");
        this.#totalNoon = this.shadowRoot.getElementById("totalNoon");
        this.#totalWeek = this.shadowRoot.getElementById("totalWeek");

        this.#inputsHalf = Array.from( this.#gridHalf.getElementsByTagName("input") );
        for( const input of this.#inputsHalf )
        {
            input.addEventListener("change", this.#boundTimeHalfHandler);
        }

        this.#subtotalsHalf = Array.from( this.#gridHalf.getElementsByClassName("awp_subtotal") );

        /// full part
        this.#gridFull = this.shadowRoot.getElementById("gridFull");
        this.#checksFull = Array.from( this.#gridFull.getElementsByTagName( "axial-toggle-check" ) );
        for( const check of this.#checksFull )
        {
            check.addEventListener("toggleChanged", this.#boundCheckFullHandler);
        }

        this.#fullTotalWeek = this.shadowRoot.getElementById("fullTotalWeek");

        this.#inputsFull = Array.from( this.#gridFull.getElementsByTagName("input") );
        for( const input of this.#inputsFull )
        {
            input.addEventListener("change", this.#boundTimeFullHandler);
        }

        this.#subtotalsFull = Array.from( this.#gridFull.getElementsByClassName("awp_subtotal") );

        // radio
        this.#modeGroup = this.shadowRoot.getElementById("modeGroup");
        if( this.#modeGroup )
        {
            this.#modeGroup.selectedIndex = 0;
            this.#modeGroup.forceSelection = true;
            this.#modeGroup.addEventListener("indexChanged", this.#boundModeHandler );
        }
    }

    #timeHalfHandler( event )
    {
        const input = event.target;
        const css = event.target.classList.value.split(" ")[1];

        let start;
        let end;
        let subtotal;

        if( css.indexOf( "start" ) > 0 )
        {
            start = input;
            end = this.#gridHalf.getElementsByClassName( css.replace("start", "end") )[0];
            subtotal = this.#gridHalf.getElementsByClassName( css.replace("start", "subtotal") )[0];
        }
        else
        {
            end = input;
            start = this.#gridHalf.getElementsByClassName( css.replace("end", "start") )[0];
            subtotal = this.#gridHalf.getElementsByClassName( css.replace("end", "subtotal") )[0];
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

        this.#calculateTotalHalf();
    }

    #calculateTotalHalf()
    {
        let totalMorningHours = 0;
        let totalMorningMinutes = 0;

        let totalNoonHours = 0;
        let totalNoonMinutes = 0;

        let totalHours = 0;
        let totalMinutes = 0;
        
        for( const st of this.#subtotalsHalf )
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

        const weekPlanningEvent = new CustomEvent("weekPlanningChanged");
        this.dispatchEvent( weekPlanningEvent );
    }

    #timeFullHandler( event )
    {
        const input = event.target;
        const css = event.target.classList.value.split(" ")[1];

        let start;
        let end;
        let subtotal;

        if( css.indexOf( "start" ) > 0 )
        {
            start = input;
            end = this.#gridFull.getElementsByClassName( css.replace("start", "end") )[0];
            subtotal = this.#gridFull.getElementsByClassName( css.replace("start", "subtotal") )[0];
        }
        else
        {
            end = input;
            start = this.#gridFull.getElementsByClassName( css.replace("end", "start") )[0];
            subtotal = this.#gridFull.getElementsByClassName( css.replace("end", "subtotal") )[0];
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

        this.#calculateTotalFull();
    }

    #calculateTotalFull()
    {
        let totalHours = 0;
        let totalMinutes = 0;
        
        for( const st of this.#subtotalsFull )
        {
            const v = st.innerHTML.split(":");
            totalHours = totalHours + Number(v[0]);
            totalMinutes = totalMinutes + Number(v[1]);
        }
        console.log("full total : ", totalHours, ":", totalMinutes);

        totalHours = totalHours + Math.floor( totalMinutes / 60 );
        totalMinutes = (totalMinutes % 60);
        const resultWeek = (String(totalHours).length === 1 ? "0" + totalHours : totalHours) + ":" + (String(totalMinutes).length === 1 ? "0" + totalMinutes : totalMinutes);

        this.#fullTotalWeek.innerHTML = resultWeek;

        this.getAsArray()

        const weekPlanningEvent = new CustomEvent("weekPlanningChanged");
        this.dispatchEvent( weekPlanningEvent );
    }

    getAsArray()
    {
        let half = new Array( [], [], [], [], [], [], [] );
        for( const input of this.#inputsHalf )
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
            half[arrayIndex][valueIndex] = input.value;
        }
        
        let full = new Array( [], [], [], [], [], [], [] );
        for( const input of this.#inputsFull )
        {
            const css = input.classList.value.split(" ")[1];
            const cssArray = css.split("-");
            
            const arrayIndex = Number( cssArray[1] ) - 1;
            
            let valueIndex = -1;
            switch( cssArray[0] )
            {
                case "awp_full_start":
                    valueIndex = 0;
                break;

                case "awp_full_end":
                    valueIndex = 1;
                break;

                default:
                break;
            }
            full[arrayIndex][valueIndex] = input.value;
        }

        // finalize with check boxexs
        for( let i = 0; i < 7; i++ )
        {
            const checkHalf = this.#checksHalf[i];
            const checkFull = this.#checksFull[i];

            half[i].push( checkHalf.selected );
            full[i].push( checkFull.selected );
        }

        return { mode: this.#modeGroup.selectedIndex, half: half, full: full };
    }

    setFromArray( planObj )
    {
        console.log(planObj)
        const modeIndex = planObj?.mode;
        if( modeIndex  == 0 || modeIndex == 1 )
        {
            this.#modeGroup.selectedIndex = modeIndex;
            if( modeIndex == 0 )
            {
                this.#gridFull.style.display = "none";
                this.#gridHalf.style.display = "grid";
            }
            else
            {
                this.#gridHalf.style.display = "none";
                this.#gridFull.style.display = "grid";
            }
        }
        
        const half = planObj?.half;
        const full = planObj?.full;
        
        for( const input of this.#inputsHalf )
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
            input.value = half[arrayIndex][valueIndex];
        }

        for( const input of this.#inputsFull )
        {
            const css = input.classList.value.split(" ")[1];
            const cssArray = css.split("-");
            
            const arrayIndex = Number( cssArray[1] ) - 1;
            
            let valueIndex = -1;
            switch( cssArray[0] )
            {
                case "awp_full_start":
                    valueIndex = 0;
                break;

                case "awp_full_end":
                    valueIndex = 1;
                break;

                default:
                break;
            }
            input.value = full[arrayIndex][valueIndex];
        }
        this.#updateAllInputs();
    }

    #updateAllInputs()
    {
        for( let i = 0; i < 7; i++ )
        {
            const index = String( i + 1 );

            // morning
            const mStartCss = "awp_morning_start-" + index;
            const mEndCss = "awp_morning_end-" + index;
            const mSubtotalCss = "awp_morning_subtotal-" + index;

            const mstart = this.#gridHalf.getElementsByClassName(mStartCss)[0];
            const mend = this.#gridHalf.getElementsByClassName(mEndCss)[0];
            const msubtotal = this.#gridHalf.getElementsByClassName(mSubtotalCss)[0];

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

            const nstart = this.#gridHalf.getElementsByClassName(nStartCss)[0];
            const nend = this.#gridHalf.getElementsByClassName(nEndCss)[0];
            const nsubtotal = this.#gridHalf.getElementsByClassName(nSubtotalCss)[0];

            const ntimeStart = nstart.value.split(":");
            const ntimeEnd = nend.value.split(":");

            const ndateStart = new Date(0, 0, 0, Number( ntimeStart[0] ), Number( ntimeStart[1] ), 0 );
            const ndateEnd = new Date(0, 0, 0, Number( ntimeEnd[0] ), Number( ntimeEnd[1] ), 0 );

            const ndelta = ndateEnd.getTime() - ndateStart.getTime();
            const nhours = Math.floor( ndelta / 1000 / 60 / 60 );
            const nminutes = (ndelta - (nhours * 1000 * 60 * 60) ) / 1000 / 60;

            const nresult = (String(nhours).length === 1 ? "0" + nhours : nhours) + ":" + (String(nminutes).length === 1 ? "0" + nminutes : nminutes);
            nsubtotal.innerHTML = nresult;

            // full
            const fStartCss = "awp_full_start-" + index;
            const fEndCss = "awp_full_end-" + index;
            const fSubtotalCss = "awp_full_subtotal-" + index;

            const fstart = this.#gridFull.getElementsByClassName(fStartCss)[0];
            const fend = this.#gridFull.getElementsByClassName(fEndCss)[0];
            const fsubtotal = this.#gridFull.getElementsByClassName(fSubtotalCss)[0];

            const ftimeStart = fstart.value.split(":");
            const ftimeEnd = fend.value.split(":");

            const fdateStart = new Date(0, 0, 0, Number( ftimeStart[0] ), Number( ftimeStart[1] ), 0 );
            const fdateEnd = new Date(0, 0, 0, Number( ftimeEnd[0] ), Number( ftimeEnd[1] ), 0 );

            const fdelta = fdateEnd.getTime() - fdateStart.getTime();
            const fhours = Math.floor( fdelta / 1000 / 60 / 60 );
            const fminutes = (fdelta - (fhours * 1000 * 60 * 60) ) / 1000 / 60;

            const fresult = (String(fhours).length === 1 ? "0" + fhours : fhours) + ":" + (String(fminutes).length === 1 ? "0" + fminutes : fminutes);
            fsubtotal.innerHTML = fresult;
        }

        this.#calculateTotalHalf();
        this.#calculateTotalFull();

        // final end point
    }

    /// 2026
    #modeHandler( event )
    {
        if( this.#modeGroup.selectedIndex === 0 )
        {
            this.#gridFull.style.display = "none";
            this.#gridHalf.style.display = "grid";
        }
        else
        {
            this.#gridHalf.style.display = "none";
            this.#gridFull.style.display = "grid";
        }
    }

    #checksHalfHandler( event )
    {
        /** @type { AxialToggleCheck } */
        const check = event.target;
        const parentCheck = check.parentElement;
        const rn = window.getComputedStyle( parentCheck ).gridRow;
        //const cn = window.getComputedStyle( parentCheck ).gridColumn;

        for( const input of this.#inputsHalf )
        {
            const ir =  window.getComputedStyle( input ).gridRow;
            if( ir == rn )
            {
                input.disabled = check.selected;
            }
        }

        const weekPlanningEvent = new CustomEvent("weekPlanningChanged");
        this.dispatchEvent( weekPlanningEvent );

    }


    #checksFullHandler( event )
    {
        console.log("check full");
        /** @type { AxialToggleCheck } */
        const check = event.target;
        
        const parentCheck = check.parentElement;
        const rn = window.getComputedStyle( parentCheck ).gridRow;
        const cn = window.getComputedStyle( parentCheck ).gridColumn;

        for( const input of this.#inputsFull )
        {
            const ir =  window.getComputedStyle( input ).gridRow;
            if( ir == rn )
            {
                input.disabled = check.selected;
            }
        }

        const weekPlanningEvent = new CustomEvent("weekPlanningChanged");
        this.dispatchEvent( weekPlanningEvent );

    }

}
window.customElements.define("axial-week-planning", AxialWeekPlanning);
export { AxialWeekPlanning }