"use strict";

import { AxialIconButton } from "../../button/AxialIconButton.js";
import { AxialArchiveOverlay } from "../../application/AxialArchiveOverlay.js";
import { StringUtils } from "../../utils/StringUtils.js";

class AxialIconListButtonArchive extends AxialIconButton
{
    /// vars
    /** @type { String } */
    #_id;

    /** @type { String } */
    #collection;

    /** @type { String } */
    #archiveOverlayId = "axialArchiveOverlay";

    /// elements
    /** @type { AxialArchiveOverlay } */
    #archiveOverlay;

    /// events
    /** @type { Function } */
    #boundArchiveClickHandler;

    constructor()
    {
        super();
        
        this.iconName = "archive";
        this.tooltipText = "Archiver";

        this.#boundArchiveClickHandler = this.#archiveClickHandler.bind(this);
        this.addEventListener("click", this.#boundArchiveClickHandler);
    }

    get _id() { return this.#_id; }
    set _id( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white Strinbg required");
        }
        this.#_id = value;
    }

    get collection() { return this.#collection; }
    set collection( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white Strinbg required");
        }
        this.#collection = value;
    }

    static get observedAttributes()
    {
        return [ "axial-icon-name", "axial-tooltip-text", "axial-collection" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-collection" )
        {
            // control todo
            this.#collection = newValue;
        }
    }

    #archiveClickHandler( event )
    {
        console.log("archive icon click");
        this.#archiveOverlay = document.getElementById(this.#archiveOverlayId);
        if( this.#archiveOverlay )
        {
            this.#archiveOverlay.collection = this.#collection;
            this.#archiveOverlay._id = this.#_id;
            this.#archiveOverlay.show();
        }

    }
}

window.customElements.define("axial-icon-list-button-archive", AxialIconListButtonArchive);
export { AxialIconListButtonArchive }