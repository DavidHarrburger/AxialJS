"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialViewerIndicatorStep extends AxialComponentBase
{
    /** @type { Number } */
    #num;

    /** @type { String } */
    #text;

    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #badge;

    constructor()
    {
        super();
        this.classList.add("axial_viewer_indicator_step");
        this.template = "axial-viewer-indicator-step-template";
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
}
window.customElements.define("axial-viewer-indicator-step", AxialViewerIndicatorStep);
export {AxialViewerIndicatorStep }