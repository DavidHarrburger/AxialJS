"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanRuleH extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #bar;

    /// vars
    /** @type { Set<String>} */
    #POSITIONS = Object.freeze( new Set( [ "top", "bottom" ] ) );
    
    /** @type { String } */
    #position = "top";

    /** @type { Number } */
    #size = 40;

    /** @type { Boolean } */
    #isShown = true;

    constructor()
    {
        super();
        this.classList.add("axial_plan_rule_h");
        this.template = "axial-plan-rule-h-template";
    }

    static get observedAttributes()
    {
        return ["axial-position" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-position" )
        {
            if( this.#POSITIONS.has(newValue) === true && newValue !== this.#position )
            {
                this.#position = newValue;
                if( this.#bar )
                {
                    this.#layoutComponent();
                }
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#bar = this.shadowRoot.getElementById("bar");

        // we start at top
        if( this.#position === "bottom" )
        {
            this.style.top = "unset";
            this.style.bottom = "0";
            if( this.#bar )
            {
                this.#bar.style.borderTop = "1px solid #ccc";
                this.#bar.style.borderBottom = "unset";
            }
        }

    }

    get position() { return this.#position; }
    set position( value )
    {
        if( this.#POSITIONS.has(value) === false )
        {
            throw new TypeError("String value required and must be 'top' or 'bottom' ");
        }
        if( value === this.#position ) { return; }
        this.#layoutComponent();
    }

    #layoutComponent()
    {
        switch( this.#position )
        {
            case "top":
                this.style.bottom = "unset";
                this.style.top = 0;
                this.#bar.style.borderBottom = "1px solid #ccc";
                this.#bar.style.borderTop = "unset";
            break;

            case "bottom":
                this.style.top = "unset";
                this.style.bottom = 0;
                this.#bar.style.borderTop = "1px solid #ccc";
                this.#bar.style.borderBottom = "unset";
            break;

            default:
            break;
        }
    }

    show()
    {
        this.#isShown = true;
    }

    hide()
    {
        this.#isShown = false;
    }
}

window.customElements.define("axial-plan-rule-h", AxialPlanRuleH);
export { AxialPlanRuleH }