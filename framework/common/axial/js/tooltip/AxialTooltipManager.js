"use strict"

class AxialTooltipManager
{
    static #TOOLTIPS = new Set();
    static get TOOLTIPS() { return AxialTooltipManager.#TOOLTIPS; }

    static get LAYER() { return document.getElementById("axialTooltipLayer"); }

    
}
export { AxialTooltipManager }