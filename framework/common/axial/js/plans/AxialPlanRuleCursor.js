"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanRuleCursor extends AxialComponentBase
{
    /// visible
    /** @type { Boolean } */
    #isVisible = false;

    /// elements
    /** @type { HTMLElement } */
    #vBar;

    /** @type { HTMLElement } */
    #hBar;

    constructor()
    {
        super();
        this.classList.add("axial_plan_rule_cursor");
        this.template = "axial-plan-rule-cursor-template";
    }

    get isVisible() { return this.#isVisible; }
    set isVisible( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#isVisible === value ) { return; }
        this.#isVisible = value;
        
        this.style.display = this.#isVisible === true ? "block" : "none";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#vBar = this.shadowRoot.getElementById("vBar");
        this.#hBar = this.shadowRoot.getElementById("hBar");

        this.style.display = this.#isVisible === true ? "block" : "none";
    }

    updateCursor( x = 0, y = 0 )
    {
        this.#vBar.style.left = `${x}px`;
        this.#hBar.style.top = `${y}px`;
    }
}

window.customElements.define("axial-plan-rule-cursor", AxialPlanRuleCursor);
export { AxialPlanRuleCursor }