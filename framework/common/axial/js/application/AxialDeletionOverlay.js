"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialButton } from "../button/AxialButton.js";
import { PathUtils } from "../utils/PathUtils.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialDeletionOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { String } */
    #_id;

    /** @type { String } */
    #collection;

    /** @type { String } */
    #defaultDeletionPath = "./api/data/del/";

    /** @type { String } */
    #deletionPath;

    /// elements
    /** @type { AxialButton } */
    #cancel;

    /** @type { AxialButton } */
    #confirm;

    /// events
    /** @type { Function } */
    #boundCancelClickHandler;

    /** @type { Function } */
    #boundConfirmClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_deletion_overlay");
        this.template = "axial-deletion-overlay-template";

        this.useObfuscator = true;
        this.#defaultDeletionPath = PathUtils.getPathFromRelative(this.#defaultDeletionPath);

        this.#boundCancelClickHandler = this.#cancelClickHandler.bind(this);
        this.#boundConfirmClickHandler = this.#confirmClickHandler.bind(this);
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

    get collection() { return this.#collection; }
    set collection( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
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

    _buildComponent()
    {
        super._buildComponent();

        this.displayMode = "center";
        this.isModal = true;

        this.#cancel = this.shadowRoot.getElementById("cancel");
        if( this.#cancel )
        {
            this.#cancel.addEventListener("click", this.#boundCancelClickHandler);
        }

        this.#confirm = this.shadowRoot.getElementById("confirm");
        if( this.#confirm )
        {
            this.#confirm.addEventListener("click", this.#boundConfirmClickHandler);
        }
    }

    #cancelClickHandler( event )
    {
        const deletionEvent = new CustomEvent("deletionCancelled");
        this.dispatchEvent( deletionEvent );

        this.hide();
    }

    #confirmClickHandler( event )
    {
        const deletionEvent = new CustomEvent("deletionConfirmed");
        this.dispatchEvent( deletionEvent );

        let deletionPossible = true;
        if( this.#_id === undefined ) { deletionPossible = false; }
        if( this.#collection === undefined ) { deletionPossible = false; }
        if( deletionPossible === false )
        {
            // suppresion impossible
            const deletionEvent = new CustomEvent("deletionError");
            this.dispatchEvent( deletionEvent );

            this.#_id = undefined;
            this.#collection = undefined;

            window.AXIAL.notify("Une erreur s'est produite lors de la suppression des données. Les données n'ont pas été supprimées.");

            this.hide();
        }
        else
        {
            if( this.#cancel ) { this.#cancel.enabled = false; }
            if( this.#confirm ) { this.#cancel.enabled = false; }
            this.#deleteData();
        }
    }

    async #deleteData()
    {
        try
        {
            const deletionObject = 
            {
                _id: this.#_id,
                collection: this.#collection
            }
            const path = this.#deletionPath === undefined ? this.#defaultDeletionPath : this.#deletionPath
            const response = await fetch(path, { method: "POST", body: JSON.stringify(deletionObject), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            
            const deletionEvent = new CustomEvent("deletionSuccess");
            this.dispatchEvent( deletionEvent );

            window.AXIAL.notify("Les données ont été supprimées avec succès.");
        }
        catch(err)
        {
            console.log(err);
            
            const deletionEvent = new CustomEvent("deletionError");
            this.dispatchEvent( deletionEvent );

            window.AXIAL.notify("Une erreur s'est produite lors de la suppression des données. Les données n'ont pas été supprimées.");
        }
        finally
        {
            if( this.#cancel ) { this.#cancel.enabled = true; }
            if( this.#confirm ) { this.#cancel.enabled = true; }
            this.#_id = undefined;
            this.#collection = undefined;
            this.#deletionPath = undefined;
            this.hide();
        }
    }
}

window.customElements.define("axial-deletion-overlay", AxialDeletionOverlay);
export { AxialDeletionOverlay }