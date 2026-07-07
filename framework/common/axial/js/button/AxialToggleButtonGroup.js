"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { DomUtils } from "../utils/DomUtils.js";
import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleButtonGroup extends AxialComponentBase
{
    /// vars
    /** @type { Array<AxialToggleButtonBase> } */
    #toggles = new Array();

    /** @type { Number } */
    #maxCounter = 0;
    
    /** @type { Number } */
    #counter = 0;

    /** @type { Number } */
    #selectedIndex = -1;

    /** @type { Boolean } */
    #forceSelection = false;

    /** @type { Set.<String>} */
    #DIRECTIONS = Object.freeze( new Set( [ "row", "column" ] ) ); // CSS.supports(k, v) also a good choice

    /** @type { String } */
    #direction = "row"; // must be computed

    /** @type { Number } */
    #gap = 20;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLSlotElement } */
    #slot;

    /// events
    /** @type { Function } */
    #boundToggleChangedHandler;

    /** @type { Function } */
    #boundTogglesBuiltHandler;

    constructor()
    {
        super();
        this.template = "axial-toggle-button-group-template";
        this.classList.add("axial_toggle_button_group")
        this.#boundToggleChangedHandler = this.#toggleChangedHandler.bind(this);
        this.#boundTogglesBuiltHandler = this.#togglesBuiltHandler.bind(this);
    }

    static get observedAttributes()
    {
        return ["axial-direction", "axial-gap" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-direction" )
        {
            if( this.#DIRECTIONS.has(newValue) && this.#direction !== newValue )
            {
                this.#direction = newValue;
                if( this.#holder )
                {
                    this.#holder.style.flexDirection = this.#direction;
                }
            }
        }

        if( name === "axial-gap" )
        {
            const testGap = Number( newValue );
            if( isNaN( Number( testGap ) ) === false )
            {
                this.#gap = testGap
            }
            if( this.#holder )
            {
                this.#holder.style.gap = `${this.#gap}px`;
            }
        }
    }

    /**
     * TEMPORARY until add at index is ok
     * @type { HTMLElement }
     * @readonly
     */
    get holder() { return this.#holder; }
    
    _buildComponent()
    {
        super._buildComponent();
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#slot = this.shadowRoot.getElementById("slot");
        const slotElements = this.#slot.assignedElements({flatten: true});
        for( const se of slotElements )
        {
            se.addEventListener("componentBuilt", this.#boundTogglesBuiltHandler);
            /*
            if( se instanceof AxialToggleButtonBase == true )
            {
                console.log("se ok");
                this.#maxCounter++;
                se.addEventListener("componentBuilt", this.#boundTogglesBuiltHandler);
                se.addEventListener("toggleChanged", this.#boundToggleChangedHandler);
                this.addToggle( se );
            }
            */
        }
        if( this.#selectedIndex !== -1 )
        {
            if( this.#selectedIndex < this.#toggles.length )
            {
                const toggle = this.#toggles[this.#selectedIndex];
                toggle.selected = true;
            }
        }

        if( this.#holder )
        {
            this.#holder.style.flexDirection = this.#direction;
            this.#holder.style.gap = `${this.#gap}px`;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #togglesBuiltHandler( event )
    {
        const isToggle = event.target instanceof AxialToggleButtonBase;
        //console.log( "isToggle on built ", isToggle );
        if( isToggle === true )
        {
            this.addToggle( event.target )
        }

        /// ne fonctionne plus du coup
        this.#counter++;
        if( this.#counter >= this.#maxCounter )
        {
            const togglesReadyEvent = new CustomEvent("togglesReady");
            this.dispatchEvent( togglesReadyEvent );
        }
    }

    /**
     * Returns a copy of the current AxialToggleButtonBase in the group.
     * @type { Array<AxialToggleButtonBase> }
     * @public
     * @readonly
     */
    //get toggles() { return Array.from(this.#toggles); }
    get toggles() { return this.#toggles; }

    /**
     * Get or set the selected button by index.
     * @type { Number }
     * @public
     */
    get selectedIndex() { return this.#selectedIndex; }
    set selectedIndex( value ) 
    {
        if( isNaN(value) === true )
        {
            throw new TypeError( "Number value expected" );
        }

        if( this.componentBuilt === false )
        {
            // compute in _buildComponent
            this.#selectedIndex = value;
            return;
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
    addToggle( toggle )
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
     * 
     * @param {AxialToggleButtonBase} toggle 
     */
    appendToggle( toggle )
    {
        this.addToggle(toggle);
        if( this.#holder.contains( toggle ) === false )
        {
            this.#holder.appendChild( toggle );
        }
    }

    /**
     * Remove an AxialToggleButtonBase from the group (if it's in !).
     * TODO : if the removed button was selected, then update the selectedIndex value
     * @param { AxialToggleButtonBase } toggle 
     */
    removeToggle( toggle )
    {
        if( toggle instanceof AxialToggleButtonBase == false )
        {
            throw new TypeError( "AxialToggleButtonBase value expected" );
        }

        const toggleIndex = this.#toggles.indexOf( toggle );
        if( toggleIndex > -1 )
        {
            toggle.removeEventListener("toggleChanged", this.#boundToggleChangedHandler);
            this.#toggles.splice( toggleIndex, 1 );
        }
    }

    clearToggles()
    {
        for( const toggle of this.#toggles )
        {
            toggle.removeEventListener("toggleChanged", this.#boundToggleChangedHandler);
        }
        DomUtils.cleanElement( this.#holder );
        this.#toggles = new Array();
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

    /**
     * 
     * @param { AxialToggleButtonBase } toggle 
     * @returns 
     */
    addToggleListener( toggle )
    {
        return toggle.addEventListener("toggleChanged", this.#boundToggleChangedHandler);
    }
}

window.customElements.define("axial-toggle-button-group", AxialToggleButtonGroup);
export { AxialToggleButtonGroup }