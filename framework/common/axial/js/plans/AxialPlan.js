"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialPlanCell } from "./AxialPlanCell.js";
import { AxialPlanLineH } from "./AxialPlanLineH.js";
import { AxialPlanLineV } from "./AxialPlanLineV.js";
import { AxialPlanRuleH } from "./AxialPlanRuleH.js";
import { AxialPlanRuleV } from "./AxialPlanRuleV.js";
import { AxialPlanRuleCursor } from "./AxialPlanRuleCursor.js";
import { AxialPlanController } from "./AxialPlanController.js";

import { AxialPlanCube } from "./AxialPlanCube.js";

class AxialPlan extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #MIN_SIZE = 20;
    
    /** @type { Number } */
    #MIN_ROWS_COLUMNS = 7;

    /** @type { Number } */
    #size = 100;

    /** @type { Number } */
    #rows = 7;

    /** @type { Number } */
    #columns = 7;

    /** @type { AxialPlanCell } */
    #previousCell;

    /** @type { AxialPlanCell } */
    #currentCell;
    
    /** @type { DOMRect } */
    #containerBounds;

    /** @type { Boolean } */
    #isDown = false;

    /** @type { Boolean } */
    #useRules = true;

    /** @type { Number } */
    #ruleSize = 40;

    /** @type { Boolean } */
    #useRuleCursor = false;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #container;

    /** @type { HTMLElement } */
    #surface;

    /** @type { HTMLElement } */
    #cells;

    /** @type { HTMLElement } */
    #lines;

    /** @type { HTMLElement } */
    #shapes;

    /** @type { AxialPlanController } */
    #controller;

    /** @type { AxialPlanRuleH } */
    #hRuleTop;

    /** @type { AxialPlanRuleH } */
    #hRuleBottom;

    /** @type { AxialPlanRuleV } */
    #vRuleLeft;

    /** @type { AxialPlanRuleV } */
    #vRuleRight;

    /** @type { AxialPlanRuleCursor } */
    #ruleCursor;

    /// events
    /** @type { Function } */
    #boundHolderPointerMoveHandler;

    /** @type { Function } */
    #boundContainerPointerMoveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_plan");
        this.template = "axial-plan-template";

        this.#boundHolderPointerMoveHandler = this.#holderPointerMoverHandler.bind(this);
        this.#boundContainerPointerMoveHandler = this.#containerPointerMoverHandler.bind(this);
    }

    get controller() { return this.#controller; }
    set controller( value )
    {
        if( value instanceof AxialPlanController === false )
        {
            throw new TypeError("AxialPlanController value required");
        }
        this.#controller = value;
    }
    
    _buildComponent()
    {
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#container = this.shadowRoot.getElementById("container");

        this.#surface = this.shadowRoot.getElementById("surface");
        this.#cells = this.shadowRoot.getElementById("cells");
        this.#lines = this.shadowRoot.getElementById("lines");
        this.#shapes = this.shadowRoot.getElementById("shapes");

        this.#ruleCursor = this.shadowRoot.getElementById("ruleCursor");

        this.#hRuleTop = this.shadowRoot.getElementById("hRuleTop");
        this.#hRuleBottom = this.shadowRoot.getElementById("hRuleBottom");

        this.#vRuleLeft = this.shadowRoot.getElementById("vRuleLeft");
        this.#vRuleRight = this.shadowRoot.getElementById("vRuleRight");

        this.#drawPlan();
    }

    #drawPlan()
    {
        const w = this.#rows * this.#size;
        const h = this.#columns * this.#size;

        const compWidth = this.#holder.offsetWidth;
        const compHeight = this.#holder.offsetHeight;

        const x = (compWidth - w ) / 2;
        const y = (compHeight - h ) / 2;

        this.#container.style.width = `${w}px`;
        this.#container.style.height = `${h}px`;

        this.#container.style.left = `${x}px`;
        this.#container.style.top = `${y}px`;

        this.#holder.addEventListener("pointermove", this.#boundHolderPointerMoveHandler);
        this.#container.addEventListener("pointermove", this.#boundContainerPointerMoveHandler);

        for( let i = 0; i <= this.#rows; i++ )
        {
            let hx = (i * this.#size);
            let vx = hx - 1;

            for( let j = 0; j <= this.#columns; j++ )
            {
                let vy = (j * this.#size);
                let hy = vy - 1;

                if( j < this.#columns )
                {
                    const vl = new AxialPlanLineV();
                    vl.style.left = `${vx}px`;
                    vl.style.top = `${vy}px`;

                    this.#lines.appendChild(vl);
                }

                if( i < this.#rows )
                {
                    const vh = new AxialPlanLineH();
                    vh.style.left = `${hx}px`;
                    vh.style.top = `${hy}px`;

                    this.#lines.appendChild(vh);
                }

                if( i < this.#rows && j < this.#columns )
                {
                    const r = i+1;
                    const c = j+1;
                    const cell = new AxialPlanCell();
                    cell.style.gridRow = r;
                    cell.style.gridColumn = c;
                    this.#cells.appendChild(cell);
                }
                
            }
        }
        this.#containerBounds = this.#container.getBoundingClientRect();
        console.log( this.#containerBounds );
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #holderPointerMoverHandler( event )
    {
        const holderBounds = this.#holder.getBoundingClientRect();

        const cx = event.clientX;
        const cy = event.clientY;

        const px = cx - holderBounds.x;
        const py = cy - holderBounds.y;

        this.#ruleCursor.updateCursor( px, py );
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #containerPointerMoverHandler( event )
    {
        //console.log( event );
        const cx = event.clientX;
        const cy = event.clientY;

        const px = cx - this.#containerBounds.x;
        const py = cy - this.#containerBounds.y;

        if( this.#controller )
        {
            this.#controller.updateCoords( px, py );
        }

        const elts = this.shadowRoot.elementsFromPoint( cx, cy );
        for( const el of elts )
        {
            if( el instanceof AxialPlanCell === true )
            {
                if( this.#currentCell === el ) { return; }
                if( this.#currentCell !== undefined )
                {
                    this.#previousCell = this.#currentCell;
                }
                this.#currentCell = el;
                break;
            }
        }
        if( this.#previousCell )
        {
            this.#previousCell.setNormal();
        }
        if( this.#currentCell )
        {
            this.#currentCell.setOver();
        }
    }


    switchTo3D()
    {
        this.#container.style.transform = "translate3d(0, 0, -100px) rotateX(58deg)";
    }

    switchTo2D()
    {
        this.#container.style.transform = "translate3d(0, 0, 0) rotateX(0)";
    }

    showRules()
    {
        //this.#hRule.style.top = "0";
        //this.#vRule.style.left = "0";
        
    }

    hideRules()
    {
        //this.#hRule.style.top = "-40px";
        //this.#vRule.style.left = "-40px";
    }

    showCursor()
    {
        this.#ruleCursor.isVisible = true;
    }

    hideCursor()
    {
        this.#ruleCursor.isVisible = false;
    }
    
}

window.customElements.define("axial-plan", AxialPlan);
export { AxialPlan }