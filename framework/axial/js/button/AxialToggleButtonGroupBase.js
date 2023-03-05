"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase";
import { AxialToggleButtonBase } from "./AxialToggleButtonBase";

class AxialToggleButtonGroupBase extends AxialComponentBase
{
    #boundToggleChangedHandler;

    /** @type { Array<AxialToggleButtonBase> } */
    #toggles = new Array();

    /** @type { Number } */
    #selectedIndex = -1;

    /** @type { Boolean } */
    #forceSelection = false;

    constructor()
    {
        super();
        this.#boundToggleChangedHandler = this.#toggleChangedHandler.bind(this);
        console.log("end group base constructor");
    }

    _finalizeComponent()
    {
        super._finalizeComponent();
        const tempToggles = this.children;
        const tempTogglesLength = tempToggles.length;

        if( tempTogglesLength > 0 )
        {
            for( let i = 0; i < tempTogglesLength; i++ )
            {
                const tempToggle = tempToggles[i];
                this.add(tempToggle);
                console.log(tempToggle instanceof AxialToggleButtonBase === true);
                
                if( tempToggle instanceof AxialToggleButtonBase === true )
                {
                    this.add(tempToggle);
                }
                else
                {
                    throw new Error("Elements in an AxialToggleButtonGroupBase must be or extends AxialToggleButtonBase");
                }
                
            }
        }
    }

    /**
     * Returns a copy of the current AxialToggleButtonBase in the group.
     * @type { Array<AxialToggleButtonBase> }
     * @public
     * @readonly
     */
    get toggles() { return Array.from(this.#toggles); }

    /**
     * Get or set the selected button by index.
     * @type { Number }
     * @public
     */
    get selectedIndex() { return this.#selectedIndex; }
    set selectedIndex( value ) 
    {
        if( isNaN(value) == true )
        {
            throw new TypeError( "Number value expected" );
        }

        const togglesLength = this.#toggles.length;
        if( togglesLength == 0 || value > togglesLength ) { return; }

        // ensure _selectedIndex has the correct value (-1 if < 0)
        this.#selectedIndex = value < 0 ? -1 : value;

        for( let i = 0; i < togglesLength; i++ )
        {
            let currentToggle = this.#toggles[i];
            if( this.#selectedIndex == i )
            {
                currentToggle.selected = true;
            }
            else
            {
                currentToggle.selected = false;
            }
        }
    }

    getSelectedToggle()
    {
        if( this.#selectedIndex == -1 ) { return undefined; }
        return this.#toggles[this.#selectedIndex];
    }

    /**
     * Ensure we have always one button selected once the user has interacted with the group.
     * @type { Boolean }
     */
    get forceSelection() { return this.#forceSelection; }
    set forceSelection( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#forceSelection ) { return; }
        this.#forceSelection = value;

        // TODO ? what we do if no toggles already selected
    }

    /**
     * Select the AxialToggleButtonBase in the group.
     * Silent fail if the toggleButton is not in the group.
     * @param { AxialToggleButtonBase } toggle
     */
    select( toggle )
    {
        if( toggle instanceof AxialToggleButtonBase == false )
        {
            throw new TypeError( "AxialToggleButtonBase value expected" );
        }

        const togglesLength = this.#toggles.length;
        if( togglesLength == 0 ) { return; }
        if( this.#toggles.includes( toggle ) == false ) { return; }
        
        for( let i = 0; i < togglesLength; i++ )
        {
            let currentToggle = this.#toggles[i];
            if( currentToggle == toggle )
            {
                currentToggle.selected = true;
                this.#selectedIndex = i;
            }
            else
            {
                currentToggle.selected = false;
            }
        }
    }

    /**
     * Add an AxialToggleButtonBase to the group if is not already in the group.
     * TODO : If the toggle button is already selected and no button in the group are, then updated the value of selectedIndex
     * If another button is selected, then unselect it and update the value
     * @param { AxialToggleButtonBase } toggle 
     */
    add( toggle )
    {
        if( toggle instanceof AxialToggleButtonBase == false )
        {
            throw new TypeError( "AxialToggleButtonBase value expected" );
        }

        if( toggle.buttonGroup == this ) { return; }

        if( this.#toggles.includes( toggle ) == false )
        {
            toggle.buttonGroup = this;
            this.#toggles.push( toggle );
            toggle.addEventListener("toggleChanged", this.#boundToggleChangedHandler);
        }
    }

    /**
     * Remove an AxialToggleButtonBase from the group (if it's in !).
     * TODO : if the removed button was selected, then update the selectedIndex value
     * @param { AxialToggleButtonBase } toggle 
     */
    remove( toggle )
    {
        if( toggle instanceof AxialToggleButtonBase == false )
        {
            throw new TypeError( "AxialToggleButtonBase value expected" );
        }

        const toggleIndex = this.#toggles.indexOf( toggle );
        if( toggleIndex > -1 )
        {
            toggle.removeEventListener("toggleChanged", this.#boundToggleChangedHandler);
            this.#toggles.splice( toggleIndex, 1);
        }
    }

    /**
     * Get the index of AxialToggleButtonBase in the group. Returns -1 if the button is not in the group.
     * @param { AxialToggleButtonBase } toggle 
     * @return { Number }
     */
    getIndexByToggle( toggle )
    {
        if( toggle instanceof AxialToggleButtonBase == false )
        {
            throw new TypeError( "AxialToggleButtonBase value expected" );
        }
        return this.#toggles.indexOf( toggle );
    }

    /**
     * 
     * @param { Event } event 
     */
    #toggleChangedHandler( event )
    {
        const toggleChanged = event.currentTarget;
        //console.log(toggleChanged);
        let indexChanged = this.getIndexByToggle( toggleChanged );
        //console.log(indexChanged);
        const toggleSelected = toggleChanged.selected;
        //console.log(toggleSelected);

        // take care of forceselection
        if( toggleSelected == false )
        {
            indexChanged = -1; // KEEP IMPORTANT
            this.#selectedIndex = -1;
        }
        else
        {
            this.#selectedIndex = indexChanged;

            // untoggle all others buttons
            const togglesLength = this.#toggles.length;
            for( let i = 0; i < togglesLength; i++ )
            {
                if( i != indexChanged )
                {
                    let currentToggle = this.#toggles[i];
                    currentToggle.selected = false;
                }
            }
        }

        const indexChangedEvent = new CustomEvent("indexChanged", { detail: { selectedIndex: indexChanged } });
        this.dispatchEvent(indexChangedEvent);
    }
}

window.customElements.define("axial-toggle-button-group-base", AxialToggleButtonGroupBase);

export { AxialToggleButtonGroupBase }