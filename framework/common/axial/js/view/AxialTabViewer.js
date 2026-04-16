"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTabBar } from "./AxialTabBar.js";
import { AxialTabButton } from "./AxialTabButton.js";
import { AxialViewer } from "./AxialViewer.js";

class AxialTabViewer extends AxialComponentBase
{
    /// vars
    /** @type { Set<String>} */
    #TAB_POSITIONS = new Set( ["top", "bottom"] );

    /** @type { Set<String>} */
    #TAB_DIRECTIONS = new Set( ["start", "end"] );

    /** @type { String } */
    #tabPosition = "top";

    /** @type { String } */
    #tabDirection = "start";

    /** @type { Boolean } */
    #useAddTabButton = false;

    /** @type { Number } */
    #headerHeight = 60;

    /** @type { Number } */
    #footerHeight = 23;

    /** @type { Boolean } */
    #useSingleView = false;
    
    /// elements
    /** @type { HTMLElement } */
    #main;

    /** @type { HTMLElement } */
    #tabsHolder;

    /** @type { AxialTabBar } */
    #tabs;

    /** @type { AxialViewer } */
    #viewer;

    /** @type { HTMLElement } */
    #header;

    /** @type { HTMLSlotElement } */
    #headerSlot;

    /** @type { HTMLSlotElement } */
    #footerSlot;

    /** @type { HTMLElement } */
    #footer;

    /** @type { AxialTabButton} */
    #addTabButton;

    /// events
    /** @type { Function } */
    #boundBuiltHandler;

    /** @type { Function } */
    #boundIndexChangedHandler;

    /** @type { Function } */
    #boundAddTabButtonHandler;

    /** @type { Function } */
    #boundTogglesReadyHandler;

    /** @type { Function } */
    #boundTabDroppedHandler;

    /** @type { Function } */
    #boundTabDeletedHandler;

    /** @type { Function } */
    #boundViewMovedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_tab_viewer")
        this.template = "axial-tab-viewer-template";
        this.#boundBuiltHandler = this.#builtHandler.bind(this);
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
        this.#boundAddTabButtonHandler = this.#addTabButtonHandler.bind(this);
        this.#boundTogglesReadyHandler = this.#togglesReadyHandler.bind(this);

        this.#boundTabDroppedHandler = this.#tabDroppedHandler.bind(this);
        this.#boundTabDeletedHandler = this.#tabDeletedHandler.bind(this);

        this.#boundViewMovedHandler = this.#viewMovedHandler.bind(this);
    }

    /**
     * @type { AxialViewer }
     * @readonly
     */
    get viewer() { return this.#viewer; }

    /**
     * @type { AxialTabBar }
     * @readonly
     */
    get tabs() { return this.#tabs; }

    /**
     * @type { HTMLSlotElement }
     * @readonly
     */
    get headerSlot() { return this.#headerSlot; }

    /**
     * @type { HTMLSlotElement }
     * @readonly
     */
    get footerSlot() { return this.#footerSlot; }

    get useAddTabButton() { return this.#useAddTabButton; }
    set useAddTabButton( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useAddTabButton !== value )
        {
            this.#useAddTabButton = value;
            if( this.#addTabButton )
            {
                this.#addTabButton.style.display = this.#useAddTabButton === true ? "block" : "none";
            }
        }
    }

    static get observedAttributes()
    {
        return ["axial-tabs-position", "axial-tabs-direction", "axial-tabs-add"];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-tabs-position" )
        {
            if( this.#TAB_POSITIONS.has(newValue) === true && newValue !== this.#tabPosition )
            {
                this.#tabPosition = newValue;
                if( this.componentBuilt === true )
                {
                    console.log("setter position check point");
                }
            }
        }

        if( name === "axial-tabs-direction" )
        {
            if( this.#TAB_DIRECTIONS.has(newValue) === true && newValue !== this.#tabDirection )
            {
                this.#tabDirection = newValue;
                if( this.componentBuilt === true )
                {
                    console.log("setter direction check point");
                }
            }
        }

        if( name === "axial-tabs-add" )
        {
            const use = newValue == null ? false : true;
            this.useAddTabButton = use;
        }

        if( name === "axial-single" )
        {
            const single = newValue == null ? false : true;
            this.#useSingleView = single;
            console.log( this.#useSingleView );
        }
    }

    #builtHandler( event )
    {
        //console.log("TAB_VIEWER BUILT HANDLER--------------------------");
        if( this.#viewer.componentBuilt === true && this.#tabs.componentBuilt === true )
        {
            const vl = this.#viewer.views.length;
            const tl = this.#tabs.toggles.length;
            if( vl !== tl )
            {
                throw new Error("Number of tabs and views in tab viewer must be the same at initialization");
            }
            else
            {
                /*
                if( vl !== 0 )
                {
                    this.#tabs.selectedIndex = 0;
                    // ensure viewer here
                }
                    */
            }
        }
    }

    #togglesReadyHandler( event )
    {
        if( this.#viewer.views.length !== 0 )
        {
            this.#tabs.selectedIndex = 0;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#main = this.shadowRoot.getElementById("main");
        this.#tabsHolder = this.shadowRoot.getElementById("tabsHolder");
        this.#tabs = this.shadowRoot.getElementById("tabs");
        this.#viewer = this.shadowRoot.getElementById("viewer");
        this.#header = this.shadowRoot.getElementById("header");
        this.#headerSlot = this.shadowRoot.getElementById("headerSlot");
        this.#footer = this.shadowRoot.getElementById("footer");
        this.#footerSlot = this.shadowRoot.getElementById("footerSlot");
        this.#addTabButton = this.shadowRoot.getElementById("addTabButton");
        
        if( this.#tabs )
        {
            //this.#tabs.addEventListener("componentBuilt", (event) => { console.log("test tab built", event.detail)});
            this.#tabs.addEventListener("componentBuilt", this.#boundBuiltHandler);
            this.#tabs.addEventListener("indexChanged", this.#boundIndexChangedHandler);
            this.#tabs.addEventListener("togglesReady", this.#boundTogglesReadyHandler);
            //console.log("tabViewer buildComponent tabs.toggles = " + this.#tabs.toggles);
            //console.log("tabViewer buildComponent componentbuilt= " + this.#tabs.componentBuilt);
            this.#tabs.forceSelection = true;
            //this.#tabs.selectedIndex = 0;
            
            this.#tabs.addEventListener("tabDropFinished", this.#boundTabDroppedHandler);
            this.#tabs.addEventListener("tabDeleted", this.#boundTabDeletedHandler);
        }

        if( this.#viewer )
        {
            this.#viewer.addEventListener("componentBuilt", this.#boundBuiltHandler);
            this.#viewer.addEventListener("viewMoved", this.#boundViewMovedHandler);
        }
        
        if( this.#addTabButton )
        {
            this.#addTabButton.addEventListener("click", this.#boundAddTabButtonHandler);
            if( this.#useAddTabButton === true )
            {
                this.#addTabButton.style.display = "block";
            }
        }

        // default at 'top', just 2 values so no more check
        if( this.#tabPosition === "bottom" )
        {
            if( this.#main ) { this.#main.style.flexDirection = "column-reverse"; }
            if( this.#tabsHolder )
            {
                this.#tabsHolder.style.borderTop = "1px solid #ccc"; 
                this.#tabsHolder.style.borderBottom = "unset";
            }
        }

        // default at 'start', just 2 values so no more check
        if( this.#tabDirection === "end" )
        {
            if( this.#tabs )
            {
                this.#tabs.style.justifyContent = "flex-end"; 
            }
        }

        this.#layoutComponent();
    }

    #layoutComponent()
    {
        // header layout
        let showHeader = false;
        if( this.#header )
        {
            const headerChildren = Array.from(this.#header.children);
            const hl = headerChildren.length;
            if( hl > 0 )
            {
                for( const headerChild of headerChildren )
                {
                    if( headerChild instanceof HTMLSlotElement === false )
                    {
                        showHeader = true;
                    }
                    else
                    {
                        const slotElements = headerChild.assignedElements({flatten: true});
                        const sel = slotElements.length;
                        if( sel > 0 ) { showHeader = true; }
                    }
                }
            }

            if( showHeader === true  && this.#main )
            {
                // header is here
                this.#header.style.display = "flex";
                this.#main.style.top = `${this.#headerHeight}px`;
            }
        }

        // footer layout
        let showFooter = false;
        if( this.#footer )
        {
            const footerChildren = Array.from(this.#footer.children);
            const fl = footerChildren.length;
            if( fl > 0 )
            {
                for( const footerChild of footerChildren )
                {
                    if( footerChild instanceof HTMLSlotElement === false )
                    {
                        showFooter = true;
                    }
                    else
                    {
                        const slotElements = footerChild.assignedElements({flatten: true});
                        const sel = slotElements.length;
                        if( sel > 0 ) { showFooter = true; }
                    }
                }
            }

            if( showFooter === true  && this.#main )
            {
                // header is here
                this.#footer.style.display = "flex";
                this.#main.style.bottom = `${this.#footerHeight}px`;
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #indexChangedHandler( event )
    {
        const si = event.detail.selectedIndex;
        if( this.#viewer )
        {
            const l = this.#viewer.views.length
            if( si < l && si >= 0 )
            {
                this.#viewer.gotoViewByIndex(si);
            }
        }
        const tabViewerEvent = new CustomEvent("indexChanged", { bubbles: true, detail: { index: si } } );
        this.dispatchEvent(tabViewerEvent);
    }

    #addTabButtonHandler( event )
    {
        this.addTabView();
    }

    /**
     * Add a new AxialTabButton in the tab container #tabs (AxialTabBar) and its associated view in #viewer (AxialViewer)
     * @public
     * @param { String } label The label of the AxialTabButton
     * @param { index } index The index where we place the tab and the view. Default value -1 means that the elements are added at the end / last position. If the index is higher than the number of views and tabs, it is normalized to -1.
     */
    addTabView( label = "label", index = -1 )
    {
        const selectFirst = this.viewer.views.length === 0;
        if( this.#viewer && this.#tabs )
        {
            const VIEW = this.#viewer.addView();
            const TAB = this.#tabs.addTab( label );

            if( selectFirst === true )
            {
                this.tabs.selectedIndex = 0;
                this.viewer.gotoViewByIndex(0);
            }
            return { view: VIEW, tab: TAB };
        }
        return undefined;
    }

    #tabDroppedHandler( event )
    {
        console.log("MEGA IMPORTANT TAB DROPPED", event);
        if( this.#viewer )
        {
            this.#viewer.moveViewAt( event.detail.fromIndex, event.detail.toIndex );
        }
    }

    #tabDeletedHandler( event )
    {
        console.log(event)
        this.#viewer.deleteViewAt( event.detail.deleteIndex );
    }

    #viewMovedHandler( event )
    {
        console.log( "viewMoved" );
    }

}

window.customElements.define("axial-tab-viewer", AxialTabViewer);
export { AxialTabViewer }