"use strict";

import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";
import { AxialTabToggle } from "./AxialTabToggle.js";
import { AxialTabBarContext } from "./AxialTabBarContext.js";
import { AxialListOverlay } from "../overlay/AxialListOverlay.js";

class AxialTabBar extends AxialToggleButtonGroup
{
    /// var
    /** @type { String } */
    #contextId = "tabBarContext";

    /** @type { Boolean } */
    #useContext = false;

    /// elements
    /** @type { HTMLElement } */
    #indicator;

    /** @type { AxialTabBarContext } */
    #contextOverlay;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    /** @type { Function } */
    #boundTogglesReadyHandler;

    /// DRAG
    /** @type { Boolean } */
    #isDraggable = false;

    /** @type { AxialTabBar } */
    #currentDraggedTab;

    /** @type { Number } */
    #currentDraggedIndex = -1;

    /** @type { Function } */
    #boundTabDragStartHandler;

    /** @type { Function } */
    #boundTabDragEndHandler;

    /** @type { Function } */
    #boundTabDragEnterHandler;

    /** @type { Function } */
    #boundTabDragLeaveHandler;

    /** @type { Function } */
    #boundTabDragOverHandler;

    /** @type { Function } */
    #boundTabDropHandler;

    /// CONTEXT
    /** @type { Function } */
    #boundContextHandler;

    /** @type { Function } */
    #boundListOverlayChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_tab_bar");
        this.template = "axial-tab-bar-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
        this.#boundTogglesReadyHandler = this.#togglesReadyHandler.bind(this);

        /// DRAG PART
        this.#boundTabDragStartHandler = this.#tabDragStartHandler.bind(this);
        this.#boundTabDragEndHandler = this.#tabDragEndHandler.bind(this);
        this.#boundTabDragEnterHandler = this.#tabDragEnterHandler.bind(this);
        this.#boundTabDragLeaveHandler = this.#tabDragLeaveHandler.bind(this);
        this.#boundTabDragOverHandler = this.#tabDragOverHandler.bind(this);
        this.#boundTabDropHandler = this.#tabDropHandler.bind(this);

        /// CONTEXT
        //this.#boundContextHandler = this.#contextHandler.bind(this);
        this.#boundListOverlayChangedHandler = this.#listOverlayChangedHandler.bind(this);
    }

    get selectedIndex() { return super.selectedIndex; }
    set selectedIndex( value )
    {
        super.selectedIndex = value;
        this.#layoutIndicator();
    }

    get isDraggable() { return this.#isDraggable; }
    set isDraggable( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#isDraggable = value;
    }

    get useContext() { return this.#useContext; }
    set useContext( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#useContext = value;
    }

    get contextId() { return this.#contextId; }
    set contextId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("Sting value required");
        }
        this.#contextId = value;
        const tempContext = document.getElementById( this.#contextId );
        if( tempContext && tempContext instanceof AxialListOverlay === true )
        {
            if( tempContext !== this.#contextOverlay )
            {
                // see what we do
            }
        }
    }

    /**
     * @readonly
     */
    get contextOverlay() { return this.#contextOverlay; }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-draggable" )
        {
            this.#isDraggable = newValue === null ? false : true;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#indicator = this.shadowRoot.getElementById("indicator");
        this.#contextOverlay = document.getElementById(this.#contextId);
        if( this.#contextOverlay )
        {
            console.log("add list listener context")
            this.#contextOverlay.addEventListener("listOverlayChanged", this.#boundListOverlayChangedHandler);
        }
        this.addEventListener("togglesReady", this.#boundTogglesReadyHandler);
        this.addEventListener("indexChanged", this.#boundIndexChangedHandler);
        this.addEventListener("contextmenu", this.#boundContextHandler);
    }

    /**
     * Create a new tab and add it to the DOM
     * @param { String } label - Label of the Tab Toggle
     * @param { Number } index - Add at index ignore ATM
     * @returns { AxialTabToggle }
     */
    addTab( label = "label", index = -1 )
    {
        const tab = new AxialTabToggle();
        tab.text = label;

        tab.addEventListener("dragstart", this.#boundTabDragStartHandler);
        tab.addEventListener("dragend", this.#boundTabDragEndHandler);
        tab.addEventListener("dragenter", this.#boundTabDragEnterHandler);
        tab.addEventListener("dragleave", this.#boundTabDragLeaveHandler);
        tab.addEventListener("dragover", this.#boundTabDragOverHandler);
        tab.addEventListener("drop", this.#boundTabDropHandler);

        if( this.#isDraggable === true )
        {
            tab.draggable = true;
        }
        this.appendToggle(tab);
        return tab;
    }

    #togglesReadyHandler()
    {
        //console.log("togglesReadyHandler");
        this.#layoutIndicator();
    }

    #layoutIndicator()
    {
        if( this.#indicator && this.selectedIndex !== -1 )
        {
            let left = 0; let width = 0;
            for( let i = 0; i <= this.selectedIndex; i++ )
            {
                if( i === this.selectedIndex )
                {
                    const t = this.toggles[i];
                    width = t.offsetWidth;
                }

                if( i > 0 )
                {
                    const t = this.toggles[i-1];
                    left += t.offsetWidth;
                }
            }
            //console.log("layoutIndicator");
            //const ct = this.getSelectedToggle();
            //const bounds = ct.getBoundingClientRect();
            //const left = ct.offsetLeft;
            //const width = ct.offsetWidth;
            //console.log( bounds );
            //console.log( left);
            //console.log( width);
            this.#indicator.style.left = `${left}px`;
            this.#indicator.style.width = `${width}px`;
        }
    }

    #indexChangedHandler( event )
    {
        this.#layoutIndicator();
    }

    /// DRAG PART
    #tabDragStartHandler( event )
    {
        for( const tab of this.toggles )
        {
            if( tab == event.target )
            {
                this.#currentDraggedTab = event.target;
                this.#currentDraggedIndex =  this.toggles.indexOf(this.#currentDraggedTab);
            }
            else
            {
                tab.dropleft.style.transitionProperty = "transform";
                tab.dropright.style.transitionProperty = "transform";
            }
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #tabDragEndHandler( event )
    {
        this.#currentDraggedTab = undefined;
        this.#currentDraggedIndex =  -1;
        for( const tab of this.toggles )
        {
            tab.dropleft.style.transitionProperty = "none";
            tab.dropright.style.transitionProperty = "none";
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #tabDragEnterHandler( event )
    {        
        /** @type { AxialTabToggle } */
        const enterTab = event.target;
        const enterIndex = this.toggles.indexOf( event.target );
        if( enterIndex !== this.#currentDraggedIndex )
        {
            if( enterIndex < this.#currentDraggedIndex )
            {
                if( enterTab.dropleft ) { enterTab.dropleft.style.transform = "scaleY(1)"; }
            }
            else
            {
                if( enterTab.dropright ) { enterTab.dropright.style.transform = "scaleY(1)"; }
            }
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #tabDragLeaveHandler( event )
    {
        /** @type { AxialTabToggle } */
        const leaveTab = event.target;
        const leaveIndex = this.toggles.indexOf( event.target );

        if( leaveIndex !== this.#currentDraggedIndex )
        {
            if( leaveTab.dropleft ) { leaveTab.dropleft.style.transform = "scaleY(0)"; }
            if( leaveTab.dropright ) { leaveTab.dropright.style.transform = "scaleY(0)"; }
        }
    }

    /**
     * @param { DragEvent } event 
     */
    #tabDragOverHandler( event )
    {
        event.preventDefault();
    }

    /**
     * @param { DragEvent } event 
     */
    #tabDropHandler( event )
    {
        console.log("tab drag drop");

        /** @type { AxialTabToggle } */
        const dropTab = event.target;
        const dropIndex = this.toggles.indexOf( dropTab );

        if( dropTab.dropleft )  { dropTab.dropleft.style.transform = "scaleY(0)"; }
        if( dropTab.dropright ) { dropTab.dropright.style.transform = "scaleY(0)"; }

        if( dropIndex === this.#currentDraggedIndex ) { return; }

        // copy the tab
        const copyTab = new AxialTabToggle();
        copyTab.text = this.#currentDraggedTab.text;

        this.addToggleListener( copyTab );

        copyTab.addEventListener("dragstart", this.#boundTabDragStartHandler);
        copyTab.addEventListener("dragend", this.#boundTabDragEndHandler);
        copyTab.addEventListener("dragenter", this.#boundTabDragEnterHandler);
        copyTab.addEventListener("dragleave", this.#boundTabDragLeaveHandler);
        copyTab.addEventListener("dragover", this.#boundTabDragOverHandler);
        copyTab.addEventListener("drop", this.#boundTabDropHandler);

        if( this.#isDraggable === true )
        {
            copyTab.draggable = true;
        }

        // get the indexes -> important to dispatch
        let deleteIndex = -1;
        let insertIndex = -1;

        if( dropIndex === this.toggles.length - 1 )
        {
            this.holder.appendChild(copyTab); // ARRAY : move to current index to last index

            deleteIndex = this.#currentDraggedIndex;
            insertIndex = this.toggles.length - 1;
        }
        else if( dropIndex < this.#currentDraggedIndex )
        {
            const leftTab = this.toggles[dropIndex];
            this.holder.insertBefore( copyTab, leftTab ); // ARRAY : insert after dropIndex - 1
            
            deleteIndex = this.#currentDraggedIndex + 1;
            insertIndex = dropIndex - 1;
        }
        else if( dropIndex > this.#currentDraggedIndex )
        {
            const rightTab = this.toggles[dropIndex+1];
            this.holder.insertBefore( copyTab, rightTab); // insert after dropIndex

            deleteIndex = this.#currentDraggedIndex;
            insertIndex = dropIndex;
        }
        else
        {
            console.warn("DROP OPERATION NOT HANDLED");
        }

        //console.log(insertIndex, deleteIndex);

        // update array
        this.toggles.splice( insertIndex+1, 0, copyTab );
        this.toggles.splice( deleteIndex, 1 );

        this.#currentDraggedTab.remove();

        // dispatch final drop
        const tabEvent = new CustomEvent("tabDropFinished",
            { bubbles: true, 
              detail: { fromIndex: this.#currentDraggedIndex, toIndex: dropIndex }
            });

        this.dispatchEvent(tabEvent);
    }

    #contextHandler( event )
    {
        if( this.#useContext === true )
        {
            console.log("context called");
            console.log("target", event.target );
            console.log("currentTarget", event.currentTarget);
        }
    }

    #listOverlayChangedHandler( event )
    {
        
        if( this.#useContext === true )
        {
            const initializer = this.#contextOverlay.contextInitializer;
            const tabIndex = this.toggles.indexOf( initializer);
            //console.log(tabIndex);
            if( tabIndex >= 0 )
            {
                /// SUPER WARNING
                if( event.detail.label === "Supprimer l'onglet" )
                {
                    console.log("deletion entry point");
                    this.toggles.splice( tabIndex, 1 );
                    initializer.remove();

                    // dispatch final drop
                    const tabEvent = new CustomEvent("tabDeleted", { bubbles: true, detail: { deleteIndex: tabIndex } });

                    this.dispatchEvent(tabEvent);
                }
            }
        }
    }
}

window.customElements.define("axial-tab-bar", AxialTabBar);
export { AxialTabBar }