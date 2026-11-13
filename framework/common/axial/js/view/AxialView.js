"use strict";

import { AxialViewBase } from "./AxialViewBase.js";

class AxialView extends AxialViewBase
{
    /** @type { HTMLElement } */
    #holder;

    /** @type { Function } */
    #boundForwardLeavingHandler;

    /** @type { Function } */
    #boundForwardEnteringHandler;

    /** @type { Function } */
    #boundBackardLeavingHandler;

    /** @type { Function } */
    #boundBackwardEnteringHandler;

    constructor()
    {
        super();
        this.classList.add("axial_view");
        this.template = "axial-view-template";

        this.#boundForwardLeavingHandler   = this.#forwardLeavingHandler.bind(this);
        this.#boundForwardEnteringHandler  = this.#forwardEnteringHandler.bind(this);
        this.#boundBackardLeavingHandler   = this.#backwardLeavingHandler.bind(this);
        this.#boundBackwardEnteringHandler = this.#backwardEnteringHandler.bind(this);
    }

    /**
     * @readonly
     * @type { HTMLElement }
     */
    get holder() { return this.#holder; }

    _buildComponent()
    {
        super._buildComponent();
        this.#holder = this.shadowRoot.getElementById("holder");

        this.addEventListener("forwardLeaving", this.#boundForwardLeavingHandler);
        this.addEventListener("forwardEntering", this.#boundForwardEnteringHandler);
        this.addEventListener("backwardLeaving", this.#boundBackardLeavingHandler);
        this.addEventListener("backwardEntering", this.#boundBackwardEnteringHandler);
    }

    #forwardLeavingHandler( event )   { this._onForwardLeaving( event ); }
    #forwardEnteringHandler( event )  { this._onForwardEntering( event ); }
    #backwardLeavingHandler( event )  { this._onBackwardLeaving( event ); }
    #backwardEnteringHandler( event ) { this._onBackwardEntering( event); }

    /** @abstract */
    _onForwardLeaving( event )
    {
        console.log("forwardLeaving");
    }
    
    /** @abstract */
    _onForwardEntering( event )
    {
        console.log("forwardEntering");
    }

    /** @abstract */ 
    _onBackwardLeaving( event )
    {
        console.log("backwardLeaving");
    }

    /** @abstract */
    _onBackwardEntering( event )
    {
        console.log("backwardEntering");
    }

}
window.customElements.define("axial-view", AxialView);
export { AxialView }