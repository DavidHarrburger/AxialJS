"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialEditableBase } from "./AxialEditableBase.js";
import { AxialCounterpartBase } from "./AxialCounterpartBase.js";
import { AxialEditorContextOverlay } from "./AxialEditorContextOverlay.js";
import { AxialEditableRoot } from "./AxialEditableRoot.js";

class AxialEditorBase extends AxialComponentBase
{
    /** @type { Array<AxialEditableBase> } */
    #editables = new Array();

    /** @type { Array<AxialCounterpartBase> } */
    #counterparts = new Array();

    /** @type { AxialEditableBase } */
    #selectedEditable;

    /** @type { AxialEditorContextOverlay } */
    #context;

    /** @type { AxialEditableRoot } */
    #root;

    /** @type { Function } */
    #boundEditableSelectedChanged;

    constructor()
    {
        super();
        this.#boundEditableSelectedChanged = this.#editableSelectedChanged.bind(this);
    }

    /**
     * @type { AxialEditableBase }
     * @readonly
     */
    get selectedEditable() { return this.#selectedEditable; }

    get root() { return this.#root; }
    set root( value )
    {
        if( value instanceof AxialEditableRoot === false )
        {
            throw new TypeError("AxialEditableRoot required");
        }
        this.#root = value;
        this.#root.addEventListener("editableSelectedChanged", this.#boundEditableSelectedChanged);
    }

    /**
     * 
     * @param { AxialEditableBase } editable 
     * @param { AxialEditableBase } target 
     */
    addEditable( editable, target )
    {
        if( editable instanceof AxialEditableBase === false )
        {
            throw new TypeError("AxialEditableBase value required");
        }
        
        editable.editor = this;
        this.#editables.push( editable );
        editable.addEventListener("editableSelectedChanged", this.#boundEditableSelectedChanged);

        target.addEditableElement( editable );
    }

    #editableSelectedChanged( event )
    {
        /** @type { AxialEditableBase } */
        const editable = event.target;
        console.log( editable );

        
        // PAS JOLI DU TOUT
        if( this.#selectedEditable == undefined )
        {
            if( editable.selected === true )
            {
                this.#selectedEditable = editable;
            }
        }
        else
        {
            if( this.#selectedEditable === editable )
            {
                // editable should be false, just in case we handle the case
                if( editable.selected === true )
                {
                    console.warn("unhandle case")
                }
                else
                {
                    this.#selectedEditable = undefined;
                }
            }
            else
            {
                this.#selectedEditable.selected = false;
                if( editable.selected === true )
                {
                    this.#selectedEditable = editable;
                }
            }
        }

        const editorEvent = new CustomEvent("editorSelectionChanged" );
        this.dispatchEvent( editorEvent );
    }

}

window.customElements.define("axial-editor-base", AxialEditorBase);
export { AxialEditorBase }