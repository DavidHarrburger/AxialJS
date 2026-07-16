"use strict";

import { AxialIconButton } from "../../button/AxialIconButton.js";
import { AxialDeletionOverlay } from "../../application/AxialDeletionOverlay.js";
import { StringUtils } from "../../utils/StringUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialIconListButtonDelete extends AxialIconButton
{
    /// vars
    /** @type { String } */
    #_id;

    /** @type { String } */
    #collection;

    /** @type { String } */
    #deletionPath;

    /** @type { String } */
    #deletionOverlayId = "axialDeletionOverlay";

    /// elements
    /** @type { AxialDeletionOverlay } */
    #deletionOverlay;

    /// events
    /** @type { Function } */
    #boundDeleteClickHandler;

    constructor()
    {
        super();
        
        this.iconName = "trash";
        this.tooltipText = "Supprimer définitivement";

        this.#boundDeleteClickHandler = this.#deleteClickHandler.bind(this);
        this.addEventListener("click", this.#boundDeleteClickHandler);
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
            throw new Error("Not white String required");
        }
        this.#collection = value;
    }

    get deletionPath() { return this.#deletionPath; }
    set deletionPath( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white String required");
        }
        if( PathUtils.isRelative(value) === true )
        {
            this.#deletionPath = PathUtils.getPathFromRelative(value);
        }
        else
        {
            this.#deletionPath = value;
        }
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

    #deleteClickHandler( event )
    {
        console.log("delete icon click");
        this.#deletionOverlay = document.getElementById(this.#deletionOverlayId);
        if( this.#deletionOverlay )
        {
            this.#deletionOverlay.deletionPath = this.#deletionPath;
            this.#deletionOverlay.collection = this.#collection;
            this.#deletionOverlay._id = this.#_id;
            this.#deletionOverlay.show();
        }

    }
}

window.customElements.define("axial-icon-list-button-delete", AxialIconListButtonDelete);
export { AxialIconListButtonDelete }