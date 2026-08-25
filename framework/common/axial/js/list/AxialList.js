"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialListItem } from "./AxialListItem.js";
import { DomUtils } from "../utils/DomUtils.js";
import { AxialButton } from "../button/AxialButton.js";
import { AxialInputBase } from "../core/AxialInputBase.js";
import { AxialListDivider } from "./AxialListDivider.js";
import { AxialListAccordionElement } from "./AxialListAccordionElement.js";

class AxialList extends AxialComponentBase
{
    /// vars
    /** @type { Function } */
    #itemClass;

    /** @type { Array.<AxialListItem | AxialListAccordionElement> } */
    #items = new Array();

    ///elemets
    /** @type { HTMLElement } */
    #header;

    /** @type { HTMLSlotElement } */
    #headerSlot;

    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #footer;

    /** @type { HTMLSlotElement } */
    #footerSlot;

    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { String } */
    #dateFilter = "creation_date";

    // list and llist items
    /** @type { Function } */
    #boundTrashHandler;

    /** @type { Function } */
    #boundClonedHandler;

    /** @type { Function } */
    #boundShortcutRequestedHandler;

    /// drag and drop
    /** @type { AxialListItem } */
    #currentDraggedItem;

    /** @type { Number } */
    #currentDraggedIndex = -1;

    /** @type { Function } */
    #boundDragStartedHandler;

    /** @type { Function } */
    #boundDragEndedHandler;

    /** @type { Function } */
    #boundDragOverHandler;

    /** @type { Function } */
    #boundDragEnterHandler;

    /** @type { Function } */
    #boundDragLeaveHandler;

    /** @type { Function } */
    #boundDropHandler;

    /// search
    /** @type { Set.<String> } */
    #searchDataKeys = new Set();

    /** @type { Function } */
    #boundSearchHandler;

    constructor()
    {
        super();
        this.classList.add("axial_list");
        this.template = "axial-list-template";

        // list and list items
        this.#boundTrashHandler = this.#trashHandler.bind(this);
        this.#boundShortcutRequestedHandler = this.#shortcutRequestedHandler.bind(this);
        this.#boundClonedHandler = this.#clonedHandler.bind(this);
        
        // drag and drop
        this.#boundDragStartedHandler = this.#dragStartedHandler.bind(this);
        this.#boundDragEndedHandler = this.#dragEndedHandler.bind(this);

        this.#boundDragOverHandler = this.#dragOverHandler.bind(this);
        this.#boundDragEnterHandler = this.#dragEnterHandler.bind(this);
        this.#boundDragLeaveHandler = this.#dragLeaveHandler.bind(this);
        this.#boundDropHandler = this.#dropHandler.bind(this);

        // search
        this.#boundSearchHandler = this.#searchHandler.bind(this);
    }

    /**
     * @type { Array.<AxialListItem> }
     * @readonly
     */
    get items() { return this.#items; }

    /** @type { HTMLInputElement } */
    get searchInput() { return this.#searchInput; }
    set searchInput( value )
    {
        if( value instanceof HTMLInputElement === false )
        {
            throw new TypeError("HTMLInputElement value required");
        }

        if( this.#searchInput !== undefined )
        {
            this.#searchInput.removeEventListener("input", this.#boundSearchHandler);
        }

        this.#searchInput = value;
        this.#searchInput.addEventListener("input", this.#boundSearchHandler);
    }

    get itemClass() { return this.#itemClass; }
    set itemClass( value )
    {
        if( typeof value === "function" && AxialListItem.prototype.isPrototypeOf( new value() ) === true )
        {
            this.#itemClass = value;
        }
    }

    /**
     * @type { Set.<String> }
     * @readonly
     */
    get searchDataKeys() { return this.#searchDataKeys; }

    _buildComponent()
    {
        super._buildComponent();

        this.#header = this.shadowRoot.getElementById("header");
        this.#headerSlot = this.shadowRoot.getElementById("headerSlot");
        this.#content = this.shadowRoot.getElementById("content");
        this.#footer = this.shadowRoot.getElementById("footer");
        this.#footerSlot = this.shadowRoot.getElementById("footerSlot");

        if( this.#headerSlot )
        {
            const headerElements = this.#headerSlot.assignedElements();
            if(headerElements.length === 0 )
            {
                this.#header.style.display = "none";
            }
            else
            {
                for( const he of headerElements )
                {
                    he.style.color = "#5c5c5cff";
                    //he.style.textAlign = "left";
                    he.style.textTransform = "uppercase";
                    he.style.fontSize = "14px";
                    he.style.fontWeight = "700";
                }
            }
        }

        if( this.#footerSlot )
        {
            const footerSlot = this.#footerSlot.assignedElements();
            if( footerSlot.length === 0 )
            {
                this.#footer.style.display = "none";
            }
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

    #updateComponent()
    {
        if( Array.isArray(this.data) === true )
        {
            /// TODO IMPORTANT SUPER REWORK CAUSE OF THE ARRAYS AND REFERENCES !!!
            this.data.sort( this.#dateSorter );

            this.empty();
            this.addManyItems( this.data );
            ///
            /// NEVER NEVER DELETE
            ///

            /*
            for( let i = 0; i < this.data.length; i++ )
            {
                let item;
                const itemData = this.data[i];
                if( itemData.itemType && itemData.itemType === "divider" )
                {
                    item = this.addDivider();
                }
                else
                {
                    item = this.addItem();
                }
                item.data = itemData;
            }
            */
            
            /*
            const fragment = new DocumentFragment();
            for( let i = 0; i < this.data.length; i++ )
                {
                    let item;
                    const itemData = this.data[i];
                    if( itemData.itemType && itemData.itemType === "divider" )
                    {
                        item = new AxialAdminListDivider();
                    }
                    else
                    {
                        item = new this.#itemClass();
                    }
                    item.data = itemData;

                    item.addEventListener("listItemTrash", this.#boundTrashHandler);
                    item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
                    item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
                    item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);

                    fragment.appendChild( item );
                    this.#items.push( item );
                }
                this.#content.appendChild( fragment );

                /// HERE ADD ITEMS with s ADDED -> better perf everywhere
                const listItemAddedEvent = new CustomEvent( "listItemAdded", { bubbles: true } );
                this.dispatchEvent( listItemAddedEvent );
            */
        }
    }

    #dateSorter( a, b )
    {
        let r = 0;
        if( a.creation_date && b.creation_date )
        {
            const ad = new Date(a.creation_date);
            const bd = new Date(b.creation_date);

            if( ad < bd )
            {
                r = 1;
            }
            else if( ad > bd )
            {
                r = -1;
            }
            else
            {
                r = 0;
            }
        }
        return r;
    }

    empty()
    {
        if( this.#content )
        {
            this.#items = new Array();
            DomUtils.cleanElement( this.#content );
        }
    }

    #trashHandler( event )
    {
        const item = event.detail.item;
        this.removeItem( item );
    }

    #clonedHandler( event )
    {
        console.log("cloned intercepted we dispatch listChangedFrom the list");
        const listEvent = new CustomEvent( "listChanged");
        this.dispatchEvent( listEvent );
    }

    #shortcutRequestedHandler( event )
    {
        this.#applyShortcut( event.detail.key, event.detail.index, event.detail.input, event.target );
    }

    /**
     * 
     * @param { String } key 
     * @param { Number } index 
     * @param { AxialInputBase } input 
     * @param { AxialListItem } dispatcher 
     */
    #applyShortcut( key, index, input, dispatcher )
    {
        const dispatcherIndex = this.#items.indexOf( dispatcher );
        switch( key )
        {
            case "d":
                for( const item of this.#items )
                {
                    if( item._applyShortcut ) { item._applyShortcut( key, index, input, dispatcher ); }
                }
            break;

            case "ArrowDown":
                const downIndex = (dispatcherIndex+1) > this.#items.length-1 ? 0 : (dispatcherIndex + 1);
                const downItem = this.#items[downIndex];
                if( downItem && downItem._applyShortcut )
                {
                    downItem._applyShortcut( key, index, input, dispatcher );
                }
            break;

            case "ArrowUp":
                const upIndex = (dispatcherIndex-1) < 0 ? this.#items.length-1 : (dispatcherIndex - 1);
                const upItem = this.#items[upIndex];
                if( upItem && upItem._applyShortcut )
                {
                    upItem._applyShortcut( key, index, input, dispatcher );
                }
            break;

            case "ArrowLeft":
                dispatcher._applyShortcut( key, index, input, dispatcher );
            break;

            case "ArrowRight":
                console.log( "right shortcut in list");
                dispatcher._applyShortcut( key, index, input, dispatcher );
            break;

            default:
            break;
        }
    }

    /**
     * Add a draggable divider to have a better vision of the data
     * @returns { AxialListDivider }
     */
    addDivider()
    {
        if( this.#content )
        {
            const item = new AxialListDivider();
            
            item.addEventListener("listItemCloned", this.#boundClonedHandler);
            item.addEventListener("listItemTrash", this.#boundTrashHandler);
            item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
            item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
            item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);
            
            this.#content.appendChild( item );
            this.#items.push( item );
            
            const listItemAddedEvent = new CustomEvent( "listItemAdded", { bubbles: true, detail: { item: item } } );
            this.dispatchEvent( listItemAddedEvent );

            return item;
        }
        return null;
    }

    addAccordion()
    {
        if( this.#content )
        {
            const acc = new AxialListAccordionElement();
            this.#content.appendChild( acc );
            //acc.open();
            return acc;
        }
        return;
    }

    /**
     * 
     * @param { AxialListAccordionElement } acc 
     * @returns 
     */
    addItemToAccordion( acc )
    {
        if( this.#content && acc)
        {
            const item = new this.#itemClass();
            
            item.addEventListener("listItemCloned", this.#boundClonedHandler);
            item.addEventListener("listItemTrash", this.#boundTrashHandler);
            item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
            item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
            item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);
            
            acc.addElement( item );
            this.#items.push( item );
            
            return item;
        }
        return;
    }

    /**
     * Simply add a new item to the list if item is defined.
     * @returns { AxialListItem }
     */
    addItem()
    {
        if( this.#content && this.#itemClass )
        {
            const item = new this.#itemClass();
            
            item.addEventListener("listItemCloned", this.#boundClonedHandler);
            item.addEventListener("listItemTrash", this.#boundTrashHandler);
            item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
            item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
            item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);
            
            this.#content.appendChild( item );
            this.#items.push( item );
            
            const listItemAddedEvent = new CustomEvent( "listItemAdded", { bubbles: true, detail: { item: item } } );
            this.dispatchEvent( listItemAddedEvent );

            return item;
        }
        return null;
    }

    addItemWidthDefaults( defaultObject )
    {
        if( this.#content && this.#itemClass )
        {
            console.log( "should happen something", defaultObject );
            const item = new this.#itemClass(defaultObject);
            
            item.addEventListener("listItemCloned", this.#boundClonedHandler);
            item.addEventListener("listItemTrash", this.#boundTrashHandler);
            item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
            item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
            item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);
            
            this.#content.appendChild( item );
            this.#items.push( item );
            
            const listItemAddedEvent = new CustomEvent( "listItemAdded", { bubbles: true, detail: { item: item } } );
            this.dispatchEvent( listItemAddedEvent );

            return item;
        }
        return null;
    }

    /**
     * 
     * @param { Array } array 
     */
    addManyItems( array )
    {
        if( Array.isArray( array ) === false )
        {
            throw new TypeError("Array value required");
        }
        //let itemsToReturned = [];
        const fragment = new DocumentFragment();
        const al = array.length;
        for( let i = 0; i < al; i++ )
        {
            let item;
            const itemData = array[i];
            if( itemData.itemType && itemData.itemType === "divider" )
            {
                item = new AxialListDivider();
            }
            else
            {
                item = new this.#itemClass();
            }
            item.data = itemData;

            item.addEventListener("listItemCloned", this.#boundClonedHandler);
            item.addEventListener("listItemTrash", this.#boundTrashHandler);
            item.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
            item.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
            item.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);

            fragment.appendChild( item );
            this.#items.push( item );
        }
        this.#content.appendChild( fragment );

        /// HERE ADD ITEMS with s ADDED -> better perf everywhere
        const listEvent = new CustomEvent( "listManyItemsAdded", { bubbles: true, detail: { items: this.#items } } );
        this.dispatchEvent( listEvent );

        return this.#items;
    }

    /**
     * @param { AxialListItem } item 
     */
    removeItem( item )
    {
        if( item instanceof AxialListItem === false )
        {
            throw new TypeError("AxialAdminListItem value required");
        }

        const items = Array.from( this.#content.children );
        const index = items.indexOf( item );
        this.#items.splice( index, 1 );
        item.remove();
        const listItemTrashedEvent = new CustomEvent( "listItemTrashed", { bubbles: true } );
        this.dispatchEvent( listItemTrashedEvent );
    }

    /// drag and drop
    /**
     * 
     * @param { CustomEvent } event 
     */
    #dragStartedHandler( event )
    {
        //console.log("add drop targets");

        for( const item of this.#items )
        {
            if( item == event.target )
            {
                this.#currentDraggedItem = event.target;
                this.#currentDraggedIndex = this.#items.indexOf(this.#currentDraggedItem);
            }
            else
            {
                item.dropbottom.style.transitionProperty = "transform";
                item.droptop.style.transitionProperty = "transform";

                item.addEventListener("dragenter", this.#boundDragEnterHandler);
                item.addEventListener("dragleave", this.#boundDragLeaveHandler);
                item.addEventListener("dragover", this.#boundDragOverHandler);
                item.addEventListener("drop", this.#boundDropHandler);
            }
        }
    }

    #dragEndedHandler( event )
    {
        //console.log("remove drop targets");
        
        this.#currentDraggedItem = undefined;
        this.#currentDraggedIndex = -1;
        for( const item of this.#items )
        {
            item.dropbottom.style.transitionProperty = "none";
            item.droptop.style.transitionProperty = "none";

            item.removeEventListener("dragenter", this.#boundDragEnterHandler);
            item.removeEventListener("dragleave", this.#boundDragLeaveHandler);
            item.removeEventListener("dragover", this.#boundDragOverHandler);
            item.removeEventListener("drop", this.#boundDropHandler);
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #dragOverHandler( event ) { event.preventDefault(); }

    /**
     * @param { DragEvent } event 
     */
    #dragEnterHandler( event )
    {
        //console.log("DRAG ENTER");
        //console.log( event.target );

        event.dataTransfer.dropEffect = "move";

        /** @type { AxialAdminListItem } */
        const enterItem = event.target;
        const enterIndex = this.#items.indexOf( enterItem );

        if( enterIndex < this.#currentDraggedIndex )
        {
            if( enterItem.droptop )    { enterItem.droptop.style.transform = "scaleX(1)"; }
        }
        else
        {
            if( enterItem.dropbottom ) { enterItem.dropbottom.style.transform = "scaleX(1)"; }
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #dragLeaveHandler( event )
    {
        //console.log("DRAG LEAVE");
        //console.log( event.target );

        /** @type { AxialAdminListItem } */
        const leaveItem = event.target;
        const leaveIndex = this.#items.indexOf( leaveItem );

        if( leaveIndex < this.#currentDraggedIndex )
        {
            if( leaveItem.droptop )    { leaveItem.droptop.style.transform = "scaleX(0)"; }
        }
        else
        {
            if( leaveItem.dropbottom ) { leaveItem.dropbottom.style.transform = "scaleX(0)"; }
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #dropHandler( event )
    {
        console.log("DROP OK");
        //console.log( event.target);

        /** @type { AxialAdminListItem } */
        const dropItem = event.target;
        const dropIndex = this.#items.indexOf( dropItem );

        if( dropItem.droptop )    { dropItem.droptop.style.transform = "scaleX(0)"; }
        if( dropItem.dropbottom ) { dropItem.dropbottom.style.transform = "scaleX(0)"; }

        //console.log( dropIndex );
        const copyItemData = this.#currentDraggedItem._getAsObject();

        let deleteIndex = -1;
        let insertIndex = -1;

        const copyItem = this.#currentDraggedItem instanceof AxialListDivider === true ? new AxialListDivider : new this.#itemClass();
        copyItem.data = copyItemData;

        copyItem.addEventListener("listItemTrash", this.#boundTrashHandler);
        copyItem.addEventListener("listItemShortcutRequested", this.#boundShortcutRequestedHandler);
        copyItem.addEventListener("listItemDragStarted", this.#boundDragStartedHandler);
        copyItem.addEventListener("listItemDragEnded", this.#boundDragEndedHandler);

        if( dropIndex === this.#items.length - 1 )
        {
            this.#content.appendChild(copyItem); // ARRAY : move to current index to last index
            
            deleteIndex = this.#currentDraggedIndex;
            insertIndex = this.#items.length - 1;
        }
        else if( dropIndex < this.#currentDraggedIndex )
        {
            const infItem = this.#items[dropIndex];
            this.#content.insertBefore( copyItem, infItem); // ARRAY : insert after dropIndex - 1
            
            deleteIndex = this.#currentDraggedIndex + 1;
            insertIndex = dropIndex - 1;
        }
        else if( dropIndex > this.#currentDraggedIndex )
        {
            const supItem = this.#items[dropIndex+1];
            this.#content.insertBefore( copyItem, supItem); // insert after dropIndex

            deleteIndex = this.#currentDraggedIndex;
            insertIndex = dropIndex;
        }
        else
        {
            console.warn("DROP OPERATION NOT HANDLED");
        }

        // IMPORTANT KEEP LOGS
        //console.log("deleteIndex = ", deleteIndex);
        //console.log("insertIndex = ", insertIndex);

        //console.log( "SPLICE ADD");
        this.#items.splice( insertIndex+1, 0, copyItem );
        //console.log( this.#items );
        
        //console.log( "SPLICE DELETE");
        this.#items.splice(deleteIndex, 1);
        //console.log( this.#items );

        this.#currentDraggedItem.remove();
            
        const listItemAddedEvent = new CustomEvent( "listItemAdded", { bubbles: true, detail: { item: copyItem } } );
        this.dispatchEvent( listItemAddedEvent );

        const listItemDropFinishedEvent = new CustomEvent( "listItemDropFinished", { bubbles: true } );
        this.dispatchEvent(listItemDropFinishedEvent);
    }

    /// SEARCH
    #searchHandler( event )
    {
        const pattern = new RegExp( this.#searchInput.value.toLocaleLowerCase() );
        for( const item of this.#items )
        {
            const itemData = item.data;
            for( const key of this.#searchDataKeys )
            {
                const hasKey = Object.hasOwn(itemData, key);
                if( hasKey === true && typeof itemData[key] === "string" )
                {
                    const str = itemData[key].toLocaleLowerCase();
                    const patternFound = pattern.test(str);
                    if( patternFound === true )
                    {
                        item.style.display = "block";
                    }
                    else
                    {
                        item.style.display = "none";
                    }
                }
            }
        }
    }
}

window.customElements.define("axial-list", AxialList);
export { AxialList }