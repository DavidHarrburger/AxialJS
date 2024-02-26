"use strict"

import { AxialPopupBase } from "../popup/AxialPopupBase.js";
import { AxialPopupManager } from "../popup/AxialPopupManager.js";
import { AxialButtonBase } from "./AxialButtonBase.js";
import { AxialToggleButtonGroupBase } from "./AxialToggleButtonGroupBase.js";

class AxialToggleButtonBase extends AxialButtonBase
{
    // events
    #boundToggleClickHandler;

    /** @type { Boolean } */
    #selected = false;

    /** @type { AxialToggleButtonGroupBase } */
    #buttonGroup = undefined;

    /** @type { AxialPopupBase } */
    #popup = undefined;

    /** @type { Functionn } */
    #boundPopupHidingHandler;
    
    constructor()
    {
        super();
        this.#boundPopupHidingHandler = this.#popupHidingHandler.bind(this);
        this.#boundToggleClickHandler = this.#toggleClickHandler.bind(this);
        this.addEventListener("click", this.#boundToggleClickHandler);
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    get selected() { return this.#selected; }
    set selected( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#selected ) { return; }
        this.#selected = value;
        this._onToggleChanged();
    }

    get buttonGroup() { return this.#buttonGroup; }
    set buttonGroup( value )
    {
        
        if( value instanceof AxialToggleButtonGroupBase == false )
        {
            throw new TypeError("AxialToggleButtonGroupBase value expected");
        }
        
        if( value == this.#buttonGroup ) { return; }

        /// TODO : remove from previous button group is the toggle is already on a group ;)
        this.#buttonGroup = value;
        this.#buttonGroup.add(this);
    }

    get popup() { return this.#popup; }
    set popup( value )
    {
        if( value instanceof AxialPopupBase == false )
        {
            throw new TypeError("AxialPopupBase value expected");
        }
        if( value == this.#popup )
        {
            return;
        }
        if( this.#popup != undefined )
        {
            this.#popup.removeEventListener("popupHiding", this.#boundPopupHidingHandler);
        }
        this.#popup = value;
        this.#popup.addEventListener("popupHiding", this.#boundPopupHidingHandler);
    }

    #toggleClickHandler( event )
    {
        // experimental : check when popup is modal or not and what happen in a toggle button group
        if( this.selected === false && AxialPopupManager.currentPopup != undefined && AxialPopupManager.currentPopup == this.#popup )
        {
            return;
        }

        // TODO IMPORTANT also return on double click tap when the popup is playing ;)

        if( this.#selected == true && this.#buttonGroup != undefined && this.#buttonGroup.forceSelection == true )
        {
            return;
        }
        this.#selected = !this.#selected;

        if( this.#selected === true && this.#popup != undefined )
        {
            this.popup.show();
        }

        this._onToggleChanged();

        const toggleChangedEvent = new CustomEvent("toggleChanged", { detail: { selected: this.#selected } } );
        this.dispatchEvent(toggleChangedEvent);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #popupHidingHandler( event )
    {
        this.#selected = false;
        this._onToggleChanged();
    }

    /**
     * Manage styles and other stuff here
     * @override
     */
    _onToggleChanged() {}

}

window.customElements.define("axial-toggle-button-base", AxialToggleButtonBase);
export { AxialToggleButtonBase }