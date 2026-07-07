"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialPlanRuleV extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #bar;

    /// vars
    /** @type { Set<String>} */
    #POSITIONS = Object.freeze( new Set( [ "left", "right" ] ) );
    
    /** @type { String } */
    #position = "left";

    /** @type { Number } */
    #size = 40;

    /** @type { Boolean } */
    #isShown = true;

    constructor()
    {
        super();
        this.classList.add("axial_plan_rule_v");
        this.template = "axial-plan-rule-v-template";
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
        if( this.#position === "right" )
        {
            this.style.left = "unset";
            this.style.right = "0";
            if( this.#bar )
            {
                this.#bar.style.borderLeft = "1px solid #ccc";
                this.#bar.style.borderRight = "unset";
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
            case "left":
                this.style.right = "unset";
                this.style.left = 0;
                this.#bar.style.borderRight = "1px solid #ccc";
                this.#bar.style.borderLeft = "unset";
            break;

            case "right":
                this.style.left = "unset";
                this.style.right = 0;
                this.#bar.style.borderLeft = "1px solid #ccc";
                this.#bar.style.borderRight = "unset";
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

window.customElements.define("axial-plan-rule-v", AxialPlanRuleV);
export { AxialPlanRuleV }