"use strict";

import { AxialButtonBase } from "./AxialButtonBase.js";
import { AxialTooltip } from "../tooltip/AxialTooltip.js";
import { AxialTooltipBase } from "../tooltip/AxialTooltipBase.js";
import { AxialTooltipManager } from "../tooltip/AxialTooltipManager.js";

// TODO (super efficient we need them everywhere)
// ICON FROM FONT-AWESOME (FREE)

class AxialIconButton extends AxialButtonBase
{
    /** @type { String } */
    #NS = "http://www.w3.org/2000/svg";


    #ICON_ARCHIVE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive-icon lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>';
    #ICON_BELL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-icon lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>';
    #ICON_BELL_OFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-off preview-icon"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/></svg>';
    #ICON_CLONE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-plus-icon lucide-copy-plus"><line x1="15" x2="15" y1="12" y2="18"/><line x1="12" x2="18" y1="15" y2="15"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
    #ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
    #ICON_EDIT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>';
    #ICON_ELLIPSIS = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    #ICON_EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
    #ICON_LOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    #ICON_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-plus-icon lucide-square-plus"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    #ICON_PROJECT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-blocks-icon lucide-blocks"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>';
    #ICON_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    #ICON_X = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'

    #ICON_TEST = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-icon lucide-message-square"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>'
    
    #icons = new Map();
    
    /** @type { String } */
    #iconName;

    /** @type { String } */
    #fill = "#232323";

    /** @type { String } */
    #tooltipText;

    /** @type { String } */
    #defaultForegroundColor = "#dedede";

    /// elements
    /** @type { AxialTooltip } */
    #tooltip;

    /** @type { HTMLElement } */
    #foreground

    /** @type { HTMLElement } */
    #icon;

    /** @type { SVGPathElement } */
    #path;

    /// events
    /** @type { Function } */
    #boundComponentBuiltHandler; // we will see for the tip

    /** @type { Function } */
    #boundPointerEnterHandler;

    /** @type { Function } */
    #boundPointerLeaveHandler;
    
    constructor( iconName )
    {
        super();

        this.classList.add("axial_icon_button")
        this.template = "axial-icon-button-template";

        // we popuplate the map here so we can add more icon later
        this.#icons.set( "archive", this.#ICON_ARCHIVE );
        this.#icons.set( "bell", this.#ICON_BELL );
        this.#icons.set( "bell_off", this.#ICON_BELL_OFF );
        this.#icons.set( "clone", this.#ICON_CLONE );
        this.#icons.set( "copy", this.#ICON_COPY );
        this.#icons.set( "edit", this.#ICON_EDIT );
        this.#icons.set( "ellipsis", this.#ICON_ELLIPSIS );
        this.#icons.set( "eye", this.#ICON_EYE );
        this.#icons.set( "lock", this.#ICON_LOCK );
        this.#icons.set( "plus", this.#ICON_PLUS );
        this.#icons.set( "project", this.#ICON_PROJECT );
        this.#icons.set( "trash", this.#ICON_TRASH );
        this.#icons.set( "x", this.#ICON_X );

        this.#icons.set( "test", this.#ICON_TEST );

        this.#boundComponentBuiltHandler = this.#componentBuiltHandler.bind(this);
        this.#boundPointerEnterHandler = this.#pointerEnterHandler.bind(this);
        this.#boundPointerLeaveHandler = this.#pointerLeaveHandler.bind(this);

        this.addEventListener("componentBuilt", this.#boundComponentBuiltHandler);
        this.addEventListener("pointerenter", this.#boundPointerEnterHandler );
        this.addEventListener("pointerleave", this.#boundPointerLeaveHandler );

    }

    static get observedAttributes()
    {
        return [ "axial-icon-name", "axial-tooltip-text", "axial-background", "axial-foreground", "axial-fill" ];
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#icon = this.shadowRoot.getElementById("icon");
        if( this.#iconName && this.#icon )
        {
            /** @type { String } */
            let svg = this.#icons.get( this.#iconName ).split("currentColor");
            let inner = svg[0] + this.#fill + svg[1];
            this.#icon.innerHTML = inner;
        }
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get icon() { return this.#icon; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get foreground() { return this.#foreground; }

    /**
     * @type { AxialTooltip }
     * @readonly
     */
    get tooltip() { return this.#tooltip; }

    get iconName() { return this.#iconName; }
    set iconName( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        // check empty string

        if( this.#icons.has(value) === true )
        {
            this.#iconName = value;
            if( this.#icon )
            {
                /** @type { String } */
                let svg = this.#icons.get( this.#iconName ).split("currentColor");
                let inner = svg[0] + this.#fill + svg[1];
                this.#icon.innerHTML = inner;
            }
        }
    }

    get tooltipText() { return this.#tooltipText; }
    set tooltipText( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#tooltipText === value ) { return; }
        this.#tooltipText = value;
        if( this.componentBuilt === true )
        {
            if( this.#tooltip )
            {
                this.#tooltip.remove();
            }
            this.#tooltip = new AxialTooltip( this.#tooltipText );
            AxialTooltipManager.addTooltip( this.#tooltip );
            this.#tooltip.target = this;
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-icon-name" )
        {
            if(this.#icons.has( newValue) )
            {
                this.#iconName = newValue;
            }
        }

        if( name === "axial-tooltip-text" )
        {
            this.#tooltipText = newValue;
        }

        if( name === "axial-fill" )
        {
            if( CSS.supports( "color", newValue) === true )
            {
                this.#fill = newValue;
            }
            
        }
    }

    disconnectedCallback()
    {
        if( this.#tooltip )
        {
            this.#tooltip.remove();
        }
    }

    #componentBuiltHandler( event )
    {
        if( this.#tooltipText )
        {
            this.#tooltip = new AxialTooltip( this.#tooltipText );
            AxialTooltipManager.addTooltip( this.#tooltip );
            this.#tooltip.target = this;
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerEnterHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "1";
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #pointerLeaveHandler( event )
    {
        if( this.#foreground )
        {
            this.#foreground.style.opacity = "0";
        }
    }
}

window.customElements.define("axial-icon-button", AxialIconButton);
export { AxialIconButton }