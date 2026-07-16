"use strict";

import { AxialListItemBase } from "./AxialListItemBase.js";
import { AxialDeletionButton } from "../button/AxialDeletionButton.js";
import { AxialButton } from "../button/AxialButton.js";
import { AxialPopupManager } from "../popup/AxialPopupManager.js";
import { AxialPopupBase } from "../popup/AxialPopupBase.js";
import { AxialInputBase } from "../core/AxialInputBase.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialIconButton } from "../button/AxialIconButton.js";
import { AxialIconFetchButton } from "../button/AxialIconFetchButton.js";

import { AxialIconListButtonArchive } from "./buttons/AxialIconListButtonArchive.js";
import { AxialIconListButtonClone } from "./buttons/AxialIconListButtonClone.js";
import { AxialIconListButtonDelete } from "./buttons/AxialIconListButtonDelete.js";

class AxialListItem extends AxialListItemBase
{
    /// vars
    /** @type { String } */
    #popupId;

    /** @type { String } */
    #contextId;

    /** @type { String } */
    #initComputedDisplay;

    /** @type { Array.<AxialInputBase> } */
    #inputs;

    /** @type { Array.<Object> } */
    #defaults;

    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #actions;

    /** @type { AxialButton } */
    #editButton;

    /** @type { AxialDeletionButton } */
    #deletionButton;

    /** @type { AxialIconListButtonArchive } */
    #archiveButton;

    /** @type { AxialIconListButtonClone } */
    #cloneButton;

    /** @type { AxialIconListButtonDelete } */
    #deleteButton;

    /** @type { AxialButton } */
    #trashButton;

    /** @type { AxialButton } */
    #copyButton;

    /** @type { AxialButton } */
    #gripButton;

    /** @type { AxialOverlayBase } */
    #contextOverlay;

    /** @type { HTMLElement } */
    #droptop;

    /** @type { HTMLElement } */
    #dropbottom;

    /// events
    /** @type { Function } */
    #boundEditHandler;

    /** @type { Function } */
    #boundTrashHandler;

    /** @type { Function } */
    #boundCopyHandler;

    /** @type { Function } */
    #boundCloneSuccessHandler;

    /** @type { Function } */
    #boundGripDownHandler;

    /** @type { Function } */
    #boundGripUpHandler;

    /** @type { Function } */
    #boundDragStartHandler;

    /** @type { Function } */
    #boundDragEndHandler;

    /** @type { Function } */
    #boundInputShortcutRequestedHandler;

    /** @type { Function } */
    #boundContextHandler;

    /**
     * Create the item
     * @constructor
     * @param { Array } defaults 
     */
    constructor( defaults )
    {
        super();
        this.classList.add("axial_list_item");
        this.template = "axial-list-item-template";
        
        this.#boundCloneSuccessHandler = this.#cloneSuccessHandler.bind(this);
        
        this.#boundEditHandler = this.#editHandler.bind(this);
        this.#boundTrashHandler = this.#trashHandler.bind(this);
        this.#boundCopyHandler = this.#copyHandler.bind(this);
        this.#boundInputShortcutRequestedHandler = this.#inputShortcutRequestedHandler.bind(this);

        this.#boundContextHandler = this.#contextHandler.bind(this);

        /// drag and drop logic in da list
        this.#boundGripDownHandler = this.#gripDownHandler.bind(this);
        this.#boundGripUpHandler = this.#gripUpHandler.bind(this);

        this.#boundDragStartHandler = this.#dragStartHandler.bind(this);
        this.#boundDragEndHandler = this.#dragEndHandler.bind(this);

        // defaults
        if( Array.isArray( defaults ) === true )
        {
            this.#defaults = defaults;
        }
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get actions() { return this.#actions; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get droptop() { return this.#droptop; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get dropbottom() { return this.#dropbottom; }

    /** 
     * @type { AxialIconListButtonArchive }
     * @readonly
    */
    get archiveButton() { return this.#archiveButton; }

    /** 
     * @type { AxialIconListButtonClone }
     * @readonly
    */
    get cloneButton() { return this.#cloneButton; }

    /** 
     * @type { AxialIconListButtonDelete }
     * @readonly
    */
    get deleteButton() { return this.#deleteButton; }

    /**
     * @type { String }
     */
    get popupId() { return this.#popupId; }
    set popupId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#popupId = value;
    }

    /**
     * @type { String }
     */
    get contextId() { return this.#contextId; }
    set contextId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#contextId = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#initComputedDisplay = window.getComputedStyle(this).display;
        
        this.#background = this.shadowRoot.getElementById("background");
        this.#content = this.shadowRoot.getElementById("content");
        this.#actions = this.shadowRoot.getElementById("actions");
        
        this.#deletionButton = this.shadowRoot.getElementById("deletionButton"); // @deprecated

        this.#archiveButton = this.shadowRoot.getElementById("archiveButton");
        this.#cloneButton = this.shadowRoot.getElementById("cloneButton");
        this.#deleteButton = this.shadowRoot.getElementById("deleteButton"); // re insert trash
        this.#trashButton = this.shadowRoot.getElementById("trashButton"); // re insert trash
        this.#editButton = this.shadowRoot.getElementById("editButton");
        this.#copyButton = this.shadowRoot.getElementById("copyButton");
        this.#gripButton = this.shadowRoot.getElementById("gripButton");

        this.#droptop = this.shadowRoot.getElementById("droptop");
        if( this.#droptop )
        {
            this.#droptop.style.width = "100%";
        }

        this.#dropbottom = this.shadowRoot.getElementById("dropbottom");
        if( this.#dropbottom )
        {
            this.#dropbottom.style.width = "100%";
        }

        this.addEventListener("contextmenu", this.#boundContextHandler);

        if( this.#content )
        {
            this.#inputs = Array.from( this.#content.getElementsByClassName("axial_input_base") );
            for( const input of this.#inputs )
            {
                input.addEventListener("inputShortcutRequested", this.#boundInputShortcutRequestedHandler);
            }
        }

        if( this.#editButton )
        {
            this.#editButton.addEventListener("click", this.#boundEditHandler);
        }

        if( this.#trashButton )
        {
            this.#trashButton.addEventListener("click", this.#boundTrashHandler);
        }

        if( this.#cloneButton )
        {
            this.#cloneButton.addEventListener("fetchSuccess", this.#boundCloneSuccessHandler);
        }

        if( this.#copyButton )
        {
            this.#copyButton.addEventListener("click", this.#boundCopyHandler);
        }

        if( this.#gripButton )
        {
            this.#gripButton.addEventListener("pointerdown", this.#boundGripDownHandler );
            this.#gripButton.addEventListener("pointerup", this.#boundGripUpHandler );

            this.addEventListener("dragstart", this.#boundDragStartHandler);
            this.addEventListener("dragend", this.#boundDragEndHandler);
        }
        
        if( this.data )
        {
            this.#updateComponent();
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();

        if( this.componentBuilt === true )
        {
            this.#updateComponent();
        }
    }

    createWithDefaults() { this.#createWithDefaults(); }

    #createWithDefaults()
    {
        if( Array.isArray( this.#defaults ) === true )
        {
            console.log( "defaults creation entry point");
            for( const defobj of this.#defaults )
            {
                if( defobj.id 
                    && typeof defobj.id === "string" 
                    && defobj.default 
                    && ( typeof defobj.default === "number" || typeof defobj.default === "string" ) )
                {
                    console.log("we can add this fuckin default");
                    const element = this.shadowRoot.getElementById(defobj.id);
                    console.log( element );
                    if( element && element instanceof AxialInputBase === true )
                    {
                        element.value = defobj.default;
                    }
                }
            }
        }
    }

    #updateComponent()
    {
        if( this.#deletionButton )
        {
            this.#deletionButton._id = this.data._id;
            this.#deletionButton.model = this.data.model;
        }

        if( this._updateComponent )
        {
            this._updateComponent();
        }
    }

    _updateComponent() {}

    #editHandler( event )
    {
        console.log("edit clicked");
        if( this.#popupId !== undefined )
        {
            console.log(this.#popupId);
            const popup = AxialPopupManager.getPopupById( this.#popupId )
            if( popup )
            {
                console.log("popup should show");
                this._onItemEdit( popup );
                popup.data = this.data;
                popup.show();
            }
        }
    }

    #cloneSuccessHandler( event )
    {
        const listItemEvent = new CustomEvent("listItemCloned");
        this.dispatchEvent(listItemEvent);
    }

    #trashHandler( event )
    {
        const listItemEvent = new CustomEvent("listItemTrash", { detail: { item: this } } );
        this.dispatchEvent(listItemEvent);
    }

    #copyHandler( event )
    {
        const copyText = JSON.stringify( this._getAsObject() );
        navigator.clipboard.writeText(copyText);
    }

    #inputShortcutRequestedHandler( event )
    {
        const input = event.target;
        const index = this.#inputs.indexOf( input );
        const key = event.detail.shortcut;

        const listItemEvent = new CustomEvent("listItemShortcutRequested", { bubbles: true, detail: { key: key, index: index, input: input } } );
        this.dispatchEvent(listItemEvent);
    }

    /**
     * @abstract
     * @param { AxialPopupBase} popup - The popup to update
     */
    _onItemEdit( popup ) {}

    /**
     * @abstract
     */
    _onItemCopy() {}

    /**
     * @abstract
     * @param { String } key 
     * @param { Number } index 
     * @param { AxialInputBase } input 
     * @param { AxialAdminListItem } dispatcher 
     */
    _applyShortcut( key, index, input, dispatcher )
    {
        if( input.overlay !== undefined ) { input.overlay.hide(); }
        if( this.#content )
        {
            const localInput = this.#inputs[index];
            if( localInput instanceof AxialInputBase )
            {
                if( key === "d" )
                {
                    if( dispatcher === this ) { return; }
                    localInput.value = input.value;
                }
                else if( key === "ArrowDown" || key === "ArrowUp" )
                {
                    localInput.focus();
                }
                else if( key === "ArrowLeft" )
                {
                    const previousInput = this.#getPreviousInput(index);
                    if( previousInput !== undefined && previousInput instanceof AxialInputBase )
                    {
                        previousInput.focus();
                    }
                }
                else if( key === "ArrowRight" )
                {
                    const nextInput = this.#getNextInput(index);
                    if( nextInput !== undefined && nextInput instanceof AxialInputBase )
                    {
                        nextInput.focus();
                    }
                }
            }
        }
    }

    /// UTILS
    #getPreviousInput( index )
    {
        const pi = index - 1 < 0 ? this.#inputs.length - 1 : index - 1;
        const previousInput = this.#inputs[pi];
        
        return previousInput;
    }

    #getNextInput( index )
    {
        const ni = index + 1 >= this.#inputs.length ? 0 : index + 1;
        const nextInput = this.#inputs[ni];

        return nextInput;
    }

    /// CONTEXT MENU
    /**
     * 
     * @param { PointerEvent } event 
     */
    #contextHandler( event )
    {
        if( this.#contextId !== undefined )
        {
            event.preventDefault();
            event.stopPropagation();
            this.#contextOverlay = document.getElementById(this.#contextId);
            if( this.#contextOverlay !== undefined )
            {
                this.#contextOverlay.showAsContext( event );
            }
        }
    }

    /// DRAG AND DROP

    #gripDownHandler( event )
    {
        //console.log( "grip down");
        this.draggable = true;
    }

    #gripUpHandler( event )
    {
        //console.log( "grip up");

        this.draggable = false;

        const listItemEvent = new CustomEvent("listItemDragEnded", { bubbles: true } );
        this.dispatchEvent(listItemEvent);
    }

    #dragStartHandler( event )
    {
        //console.log( "drag start", event);
        const listItemEvent = new CustomEvent("listItemDragStarted", { bubbles: true } );
        this.dispatchEvent(listItemEvent);
    }

    #dragEndHandler( event )
    {
        console.log( "drag end", event);
        this.draggable = false;

        const listItemEvent = new CustomEvent("listItemDragEnded", { bubbles: true } );
        this.dispatchEvent(listItemEvent);
    }
}
window.customElements.define("axial-list-item", AxialListItem);
export { AxialListItem }