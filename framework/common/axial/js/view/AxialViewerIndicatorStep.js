"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialViewerIndicatorStep extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #num;

    /** @type { String } */
    #text;

    /** @type { Object } */
    #initStateProps = { color: "#aaa" };

    /** @type { Object } */
    #activeStateProps = { color: "#232323" };

    /** @type { Object } */
    #completedStateProps = { color: "#0463b1" };

    /// elements
    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #badge;

    /// events
    /** @type { Function } */
    #boundStateChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_viewer_indicator_step");
        this.template = "axial-viewer-indicator-step-template";
        this.addState("active");
        this.addState("completed");
        this.useStates = true;
        this.#boundStateChangedHandler = this.#stateChangedHandler.bind(this);
        this.addEventListener("stateChanged", this.#boundStateChangedHandler);
    }

    get num() { return this.#num; }
    set num ( value )
    {
        if( isNaN( value ) === true ) 
        {
            throw new TypeError("Number value required");
        }
        this.#num = value;
        if( this.#badge )
        {
            this.#badge.innerHTML = String( this.#num );
        }
    }

    get text() { return this.#text; }
    set text ( value )
    {
        if( typeof value !== "string" ) 
        {
            throw new TypeError("String value required");
        }
        this.#text = value;
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#badge = this.shadowRoot.getElementById("badge");
        this.#label = this.shadowRoot.getElementById("label");

        if( this.#num && this.#badge )
        {
            this.#badge.innerHTML = String( this.#num );
        }

        if( this.#text && this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #stateChangedHandler( event )
    {
        let s;
        switch(this.currentState)
        {
            case "init":
                s = this.#initStateProps;
            break;

            case "active":
                s = this.#activeStateProps;
            break;

            case "completed":
                s = this.#completedStateProps;
            break;

            default:
                s = this.#initStateProps;
            break;
        }
        this.#badge.style.borderColor = s.color;
        this.#badge.style.color = s.color;
        this.#label.style.color = s.color;
    }
}
window.customElements.define("axial-viewer-indicator-step", AxialViewerIndicatorStep);
export {AxialViewerIndicatorStep }