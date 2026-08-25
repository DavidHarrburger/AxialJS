"use strict";

import { AxialEditorBase } from "./AxialEditorBase.js";
import { AxialEditable } from "./AxialEditable.js";
import { AxialEditableRoot } from "./AxialEditableRoot.js";

import { AxialCounterpartBase } from "./AxialCounterpartBase.js";
import { AxialCounterpart } from "./AxialCounterpart.js";

import { AxialButton } from "../button/AxialButton.js";


class AxialEditor extends AxialEditorBase
{
    /** @type { HTMLElement } */
    #header;

    /** @type { HTMLElement } */
    #footer;

    /** @type { HTMLElement } */
    #main;

    /** @type { HTMLElement } */
    #structure;

    /** @type { HTMLElement } */
    #properties;

    /** @type { AxialEditableRoot} */
    #root;

    /** @type { AxialCounterpart } */
    #rootCounterpart;

    /** @type { AxialButton} */
    #addButton;

    // events
    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundSelectionChanged;

    constructor()
    {
        super();
        this.template = "axial-editor-template";

        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundSelectionChanged = this.#selectionChanged.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#header = this.shadowRoot.getElementById("header");
        this.#footer = this.shadowRoot.getElementById("footer");
        this.#main = this.shadowRoot.getElementById("main");
        this.#structure = this.shadowRoot.getElementById("structure");
        this.#properties = this.shadowRoot.getElementById("properties");

        this.#rootCounterpart = this.shadowRoot.getElementById("rootCounterpart");

        this.#root = this.shadowRoot.getElementById("root");
        if( this.#root )
        {
            if( this.#rootCounterpart )
            {
                this.#root.counterpart = this.#rootCounterpart;
            }
            this.root = this.#root;
        }

        this.#addButton = this.shadowRoot.getElementById("addButton");
        if( this.#addButton )
        {
            this.#addButton.addEventListener("click", this.#boundAddHandler);
            this.#addButton.enabled = false;
        }

        this.addEventListener("editorSelectionChanged", this.#boundSelectionChanged);
        
    }

    #addHandler( event )
    {
        this.add();
    }

    add()
    {
        const target = this.selectedEditable;
        const editable = new AxialEditable();
        this.addEditable( editable, target );
    }

    /**
     * 
     * @param { AxialEditableBase } editable 
     * @param { AxialEditableBase } target 
     */
    addEditable( editable, target )
    {
        if( this.selectedEditable === undefined ) { return; }
        super.addEditable( editable, target );
        
        /// temp
    }

    /** @type { CustomEvent } */
    #selectionChanged( event )
    {
        if( this.#addButton )
        {
            if( this.selectedEditable === undefined ) { this.#addButton.enabled = false; }
            else { this.#addButton.enabled = true; }
        }

        if( this.selectedEditable !== undefined )
        {
            this.#update();
        }
    }

    #update()
    {

    }
}

window.customElements.define("axial-editor", AxialEditor);
export { AxialEditor }