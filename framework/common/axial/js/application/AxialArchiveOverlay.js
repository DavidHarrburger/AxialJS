"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialButton } from "../button/AxialButton.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialArchiveOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { String } */
    #_id;

    /** @type { String } */
    #model;

    /** @type { String } */
    #archivePath = "./api/data/archive/";

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
        this.classList.add("axial_archive_overlay");
        this.template = "axial-archive-overlay-template";

        this.useObfuscator = true;
        this.#archivePath = PathUtils.getPathFromRelative(this.#archivePath);

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
        const archiveEvent = new CustomEvent("archiveCancelled");
        this.dispatchEvent( archiveEvent );

        this.hide();
    }

    #confirmClickHandler( event )
    {
        const archiveEvent = new CustomEvent("archiveConfirmed");
        this.dispatchEvent( archiveEvent );

        let deletionPossible = true;
        if( this.#_id === undefined ) { deletionPossible = false; }
        if( this.#model === undefined ) { deletionPossible = false; }
        if( deletionPossible === false )
        {
            // suppresion impossible
            const archiveEvent = new CustomEvent("archiveError");
            this.dispatchEvent( archiveEvent );

            this.#_id = undefined;
            this.#model = undefined;

            window.AXIAL.notify("Une erreur s'est produite lors de l'archivage des données. Les données n'ont pas été archivées.");

            this.hide();
        }
        else
        {
            if( this.#cancel ) { this.#cancel.enabled = false; }
            if( this.#confirm ) { this.#cancel.enabled = false; }
            this.#archiveData();
        }
    }

    async #archiveData()
    {
        try
        {
            const deletionObject = 
            {
                _id: this.#_id,
                model: this.#model
            }
            const response = await fetch(this.#archivePath, { method: "POST", body: JSON.stringify(deletionObject), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            
            const archiveEvent = new CustomEvent("archiveSuccess");
            this.dispatchEvent( archiveEvent );

            window.AXIAL.notify("Les données ont été archivées avec succès.");
        }
        catch(err)
        {
            console.log(err);
            
            const archiveEvent = new CustomEvent("archiveError");
            this.dispatchEvent( archiveEvent );

            window.AXIAL.notify("Une erreur s'est produite lors de l'archivage des données. Les données n'ont pas été achivées.");
        }
        finally
        {
            if( this.#cancel ) { this.#cancel.enabled = true; }
            if( this.#confirm ) { this.#cancel.enabled = true; }
            this.#_id = undefined;
            this.#model = undefined;
            this.hide();
        }
    }
}

window.customElements.define("axial-archive-overlay", AxialArchiveOverlay);
export { AxialArchiveOverlay }