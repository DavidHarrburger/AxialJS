"use strict"

import { AxialButtonBase } from "./AxialButtonBase.js";
import { AxialToggleButtonGroupBase } from "./AxialToggleButtonGroupBase.js";

class AxialToggleButtonBase_original extends AxialButtonBase
{
    // events
    #boundToggleClickHandler;

    /** @type { Boolean } */
    #selected = false;

    /** @type { AxialToggleButtonGroupBase } */
    #buttonGroup = undefined;
    
    constructor()
    {
        super();
        this.#boundToggleClickHandler = this.#toggleClickHandler.bind(this);
        this.addEventListener("click", this.#boundToggleClickHandler);
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

    #toggleClickHandler( event )
    {
        console.log("toggle button clicked");
        if( this.#selected == true && this.#buttonGroup != undefined && this.#buttonGroup.forceSelection == true )
        {
            return;
        }
        this.#selected = !this.#selected;

        this._onToggleChanged();

        const toggleChangedEvent = new CustomEvent("toggleChanged", { detail: { selected: this.#selected } } );
        this.dispatchEvent(toggleChangedEvent);
    }

    /**
     * Manage styles and other stuff here
     * @override
     */
    _onToggleChanged() {}

}

//window.customElements.define("axial-toggle-button-base", AxialToggleButtonBase);
//export { AxialToggleButtonBase }