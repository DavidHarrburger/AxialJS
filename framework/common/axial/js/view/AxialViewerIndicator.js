"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialViewerBase } from "./AxialViewerBase.js";
import { AxialViewerIndicatorStep } from "./AxialViewerIndicatorStep.js";

class AxialViewerIndicator extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #viewerId;

    /** @type { Array } */
    #steps = new Array();

    /** @type { Number } */
    #index = 0;

    /// elements
    /** @type { AxialViewerBase } */
    #viewer;

    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #bar;

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

    static get observedAttributes()
    {
        return [ "axial-viewer-id" ];
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
        this.updateIndicator();
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-viewer-id" )
        {
            const tempViewer = document.getElementById(newValue);
            if( tempViewer && tempViewer instanceof AxialViewerBase === true )
            {
                this.#viewerId = newValue;
                this.#viewer = tempViewer;
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#bar = this.shadowRoot.getElementById("bar");

        if( this.#viewer )
        {
            this.#viewer.addEventListener("viewerChanged", this.#boundViewerChangedHandler);
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
            this.updateIndicator();
        }
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

    updateIndicator()
    {
        const currentStep = this.#steps[this.#index];
        const left = currentStep.offsetLeft;
        const width = currentStep.offsetWidth;

        this.#bar.style.left = `${left}px`;
        this.#bar.style.width = `${width}px`;

    }
}

window.customElements.define("axial-viewer-indicator", AxialViewerIndicator);
export { AxialViewerIndicator }