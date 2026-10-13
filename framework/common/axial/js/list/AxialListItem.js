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
import { AxialIconListButtonLock } from "./buttons/AxialIconListButtonLock.js";

const axialListItemSheet = new CSSStyleSheet();
axialListItemSheet.replace
(`
    :host               { position: relative; width: 100%; height: 64px; font-size: 14px; font-weight: 500;}
    .axial_list_item-background    { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: transparent; border-bottom: 1px solid var(--adminBody___borderColor); }
    .axial_list_item-droptop       { transform: scaleX(0); position: absolute; top: 0; width: 0; height: 2px; background-color: #c00; 
                                transition-property: none; transition-duration: 600ms; transition-timing-function: ease; }
    .axial_list_item-dropbottom    { transform: scaleX(0); position: absolute; bottom: 0; width: 0; height: 2px; background-color: #c00;
                                transition-property: none; transition-duration: 600ms; transition-timing-function: ease; }
    .axial_list_item-content       { position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; 
                                flex-direction: row; justify-content: flex-start; align-items: center; gap: 10px; }
    .axial_list_item-actions       { flex-shrink: 0; width: auto; height: 100%; display: flex; flex-direction: row; justify-content: flex-end; align-items: center; gap: 2px; }

    .axial_list_item-prop_name
    {
    width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }

    .axial_list_item-prop_email
    {
    width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }

    .axial_list_item-prop_tel
    {
    width: 120px;
    }

    .axial_list_item-prop_creation
    {
    width: 120px;
    }
    .axial_list_item-prop_item
    {
    width: 120px;
    }
    .axial_list_item-prop { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .axial_list_item-prop_60 { width: 60px; }
    .axial_list_item-prop_80 { width: 80px; }
    .axial_list_item-prop_100 { width: 100px; }
    .axial_list_item-prop_120 { width: 100px; }
`);

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

    /** @type { AxialIconListButtonLock } */
    #lockButton;

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

    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    /** @type { Function } */
    #boundOutHandler;

    /** @type { Function } */
    #boundCancelHandler;

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
        //this.shadowRoot.adoptedStyleSheets = [axialListItemSheet];
        
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

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.#boundOutHandler = this.#outHandler.bind(this);
        this.#boundCancelHandler = this.#cancelHandler.bind(this);

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
     * @type { AxialIconButton }
     * @readonly
    */
    get editButton() { return this.#editButton; }

    /** 
     * @type { AxialIconListButtonLock }
     * @readonly
    */
    get lockButton() { return this.#lockButton; }

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
        this.#lockButton = this.shadowRoot.getElementById("lockButton");

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

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
        this.addEventListener("pointerout", this.#boundOutHandler);
        this.addEventListener("pointercancel", this.#boundCancelHandler);

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
        if( this.#popupId !== undefined )
        {
            const popup = AxialPopupManager.getPopupById( this.#popupId )
            if( popup )
            {
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
     * @param { AxialListItem } dispatcher 
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

    /**
     * 
     * @param { PointerEvent } event 
     */
    #enterHandler( event )
    {
        this.#background.style.backgroundColor = "#ffffff";
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        this.#background.style.backgroundColor = "transparent";
        
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #outHandler( event )
    {
        this.#background.style.backgroundColor = "transparent";
        
    }

    #cancelHandler( event )
    {
        this.#background.style.backgroundColor = "transparent";
        
    }
}
window.customElements.define("axial-list-item", AxialListItem);
export { AxialListItem }