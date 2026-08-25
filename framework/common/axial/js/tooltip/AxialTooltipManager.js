"use strict"

import { AxialTooltipBase } from "./AxialTooltipBase.js";

class AxialTooltipManager
{
    static #TOOLTIPS = new Set();
    static get TOOLTIPS() { return AxialTooltipManager.#TOOLTIPS; }

    static get LAYER() { return document.getElementById("axialTooltipLayer"); }

    /**
     * 
     * @param { AxialTooltipBase } tooltip 
     */
    static addTooltip( tooltip )
    {
        AxialTooltipManager.TOOLTIPS.add( tooltip );
        if( AxialTooltipManager.LAYER &&  AxialTooltipManager.LAYER.contains(tooltip) === false )
        {
            AxialTooltipManager.LAYER.appendChild(tooltip) ;
        }
    }

}
export { AxialTooltipManager }