"use strict";

import { AxialArchiveOverlay } from "../application/AxialArchiveOverlay.js";
import { AxialButton } from "./AxialButton.js";

class AxialArchiveButton extends AxialButton
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
        if( window.AXIAL && window.AXIAL.archiveOverlay && window.AXIAL.archiveOverlay instanceof AxialArchiveOverlay === true )
        {
            const archiveOverlay = window.AXIAL.archiveOverlay;
            archiveOverlay._id = this.#_id;
            archiveOverlay.model = this.#model;
            archiveOverlay.show();
        }
    }
}
window.customElements.define("axial-archive-button", AxialArchiveButton);
export { AxialArchiveButton }