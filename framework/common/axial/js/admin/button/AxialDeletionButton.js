"use strict";

import { AxialDeletionOverlay } from "../../application/AxialDeletionOverlay.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialDeletionButton extends AxialButton
{
    /// vars
    /** @type { String } */
    #_id;

    /** @type { String } */
    #model;

    /// events
    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    get _id() { return this.#_id; }
    set _id( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#_id = value;
    }

    get model() { return this.#model; }
    set model( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#model = value;
    }

    _buildComponent()
    {
        super._buildComponent();
        this.addEventListener("click", this.#boundClickHandler);
    }

    #clickHandler( event )
    {
        //const deletionOverlay = document.getElementById("deletionOverlay");
        if( window.AXIAL && window.AXIAL.deletionOverlay && window.AXIAL.deletionOverlay instanceof AxialDeletionOverlay === true )
        {
            const deletionOverlay = window.AXIAL.deletionOverlay;
            deletionOverlay._id = this.#_id;
            deletionOverlay.model = this.#model;
            deletionOverlay.show();
        }
    }
}
window.customElements.define("axial-deletion-button", AxialDeletionButton);
export { AxialDeletionButton }