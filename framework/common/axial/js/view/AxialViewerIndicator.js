"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialViewerBase } from "./AxialViewerBase.js";
import { AxialViewerIndicatorStep } from "./AxialViewerIndicatorStep.js";

class AxialViewerIndicator extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #viewerId;

    /** @type { Array<AxialViewerIndicatorStep } */
    #steps = new Array();

    /** @type { Number } */
    #index = 0;

    /** @type { Number } */
    #stepGap = 40;

    /** @type { Number } */
    #badgeSize = 60;

    /** @type { Number } */
    #lineSize = 2;

    /// elements
    /** @type { AxialViewerBase } */
    #viewer;

    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #bar;

    /** @type { HTMLElement } */
    #progress;

    /// events
    /** @type { Function } */
    #boundViewerChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_viewer_indicator");
        this.template = "axial-viewer-indicator-template";

        this.#boundViewerChangedHandler = this.#viewerChangedHandler.bind(this);
    }

    get viewer() { return this.#viewer; }
    set viewer( value )
    {
        if( value instanceof AxialViewerBase === false )
        {
            throw new TypeError("AxialViewerBase value required");
        }
        if( this.#viewer === value ) { return; }
        if( this.#viewer !== undefined )
        {
            this.#viewer.removeEventListener("viewerChanging", this.#boundViewerChangedHandler);
        }
        this.#viewer = value;
        this.#viewer.addEventListener("viewerChanging", this.#boundViewerChangedHandler);
        this.#buildIndicator();
    }

    get index() { return this.#index; }
    set index( value )
    {
        if( isNaN( value ) === true || Number.isInteger(value) === false || value < 0 )
        {
            throw new TypeError("Positive or Zero Number value expected");
        }
        
        if( value >= this.#steps.length )
        {
            value = this.#steps.length;
        }

        this.#index = value;
        this.#updateIndicator();
    }


    _buildComponent()
    {
        super._buildComponent();
        
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#bar = this.shadowRoot.getElementById("bar");
        this.#progress = this.shadowRoot.getElementById("progress");
    }

    #buildIndicator()
    {
        const views = this.#viewer.allViews;
        const vl = views.length;
        for( let i = 0; i < vl; i++ )
        {
            const view = views[i];
            let viewName = view.getAttribute("axial-name");
            if( viewName === null || viewName === "" || viewName === undefined )
            {
                viewName = "Item";
            }
            const step = new AxialViewerIndicatorStep();
            step.num = (i+1);
            step.text = viewName;

            this.#addStep(step);
        }
        const barHeight = (( this.#badgeSize + this.#stepGap ) * (vl-1));
        if( this.#bar )
        {
            this.#bar.style.height = barHeight + "px";
        }
        this.#updateIndicator();
    }

    #viewerChangedHandler( event )
    {
        this.index = this.#viewer.currentViewIndex;
    }

    /**
     * 
     * @param { AxialViewerIndicatorStep } step 
     */
    #addStep( step )
    {
        if( this.#holder )
        {
            this.#holder.appendChild(step);
            // warn on the array
            this.#steps.push(step);
        }
    }

    #updateIndicator()
    {
        
        const sl = this.#steps.length;
        for( let i = 0; i < sl; i++ )
        {
            const currentStep = this.#steps[i];
            if( i < this.#index )
            {
                currentStep.switchToState("completed");
            }
            else if( i === this.#index )
            {
                currentStep.switchToState("active");
            }
            else
            {
                currentStep.switchToState("init");
            }
        }
        
        //currentStep.
        const progressHeight = (100 / sl) * this.#index;
        if( this.#progress )
        {
            this.#progress.style.height = `${progressHeight}%`;
        }
    }
}

window.customElements.define("axial-viewer-indicator", AxialViewerIndicator);
export { AxialViewerIndicator }