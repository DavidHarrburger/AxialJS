"use strict";

import { AxialEditorBase } from "./AxialEditorBase.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialCounterpartBase } from "./AxialCounterpartBase.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialEditableBase extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #maxElements = 10;

    /** @type { Boolean } */
    #isSelected = false;

    /** @type { AxialEditorBase } */
    #editor;

    /** @type { AxialCounterpartBase } */
    #counterpart;

    /** @type { HTMLElement } */
    #content;

    /** @type { Function } */
    #acceptedClass;

    /** @type { String } */
    #outColor = "transparent";

    /** @type { String } */
    #overColor = "#0084ff";

    /** @type { String } */
    #selectedColor = "#005aad";

    /** @type { Array<AxialEditableBase } */
    #editables = []

    /** @type { String } */
    #editableName;

    /** @type { Array } */
    #editableProperties = [];

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    /** @type { Function } */
    #boundClickHandler;

    /** @type { Function } */
    #boundCounterpartValueChanged;

    constructor()
    {
        super();

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);
        this.#boundClickHandler = this.#clickHandler.bind(this);

        this.#boundCounterpartValueChanged = this.#counterpartValueChanged.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
        this.addEventListener("click", this.#boundClickHandler);

        this.#content = this;
    }

    get counterpart() { return this.#counterpart; }
    set counterpart( value )
    {
        if( value instanceof AxialCounterpartBase === false )
        {
            throw new TypeError("AxialCounterpartBase required");
        }
        this.#counterpart = value;
        this.#counterpart.addEventListener("counterpartValueChanged", this.#boundCounterpartValueChanged);
    }

    get editableName() { return this.#editableName; }
    set editableName( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("String required");
        }
        this.#editableName = value;
    }

    get editor() { return this.#editor; }
    set editor( value )
    {
        if( value instanceof AxialEditorBase === false )
        {
            throw new TypeError("AxialEditorBase");
        }
        this.#editor = value;
    }

    get content() { return this.#content; }
    set content( value )
    {
        if( value instanceof HTMLElement === false )
        {
            throw new TypeError("HTMLElement value required");
        }
        this.#content = value;
    }

    get selected() { return this.#isSelected; }
    set selected( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#isSelected = value;

        if( this.#isSelected === true )
        {
            this.style.outlineColor = this.#selectedColor;
            
        }
        else
        {
            this.style.outlineColor = this.#outColor;
        }

        if( this.#counterpart )
        {
            this.#counterpart.isVisible = this.#isSelected;
        }
        //const editorEvent = new CustomEvent("editorSelectionChanged", { bubbles: true } );
        //this.dispatchEvent( editorEvent );
    }

    _buildComponent()
    {
        super._buildComponent();
        this.classList.add("axial_editable_base");
    }

    addEditableElement( editable )
    {
        if( editable instanceof AxialEditableBase === false )
        {
            throw new TypeError("AxialEditableElement required");
        }
        if( this.#editables.length)
        this.#content.appendChild( editable );
    }

    #enterHandler( event )
    {
        if( this.#isSelected === false )
        {
            this.style.outlineColor = this.#overColor;
        }
        else
        {
            this.style.outlineColor = this.#selectedColor;
        }
    }

    #leaveHandler( event )
    {
        if( this.#isSelected === false )
        {
            this.style.outlineColor = this.#outColor;
        }
        else
        {
            this.style.outlineColor = this.#selectedColor;
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #clickHandler( event )
    {
        event.stopImmediatePropagation();
        if( this.#isSelected === false )
        {
            this.#isSelected = true;
            this.style.outlineColor = this.#selectedColor;
        }
        else
        {
            this.#isSelected = false;
            this.style.outlineColor = this.#overColor;
        }

        if( this.#counterpart )
        {
            this.#counterpart.isVisible = this.#isSelected;
        }

        const editableEvent = new CustomEvent("editableSelectedChanged", { bubbles: true } );
        this.dispatchEvent( editableEvent );
        /*
        if( this.#editor !== undefined )
        {
            
        }
        */
    }

    #counterpartValueChanged( event )
    {
        console.log(event);
    }

}

window.customElements.define("axial-editable-base", AxialEditableBase);
export { AxialEditableBase }