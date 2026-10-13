"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialCardBase } from "./AxialCardBase.js";
import { AxialCard } from "./AxialCard.js";

class AxialCardDisplayer extends AxialComponentBase
{
    /** @type { Array<AxialCardBase> } */
    #cards = [];

    /** @type { String } */
    #cssRows;

    /** @type { String } */
    #cssColumns;

    /// elements
    /** @type { HTMLElement } */
    #grid;

    /** @type { HTMLSlotElement } */
    #gridSlot;

    constructor()
    {
        super();
        this.classList.add( "axial_card_displayer" );
        this.template = "axial-card-displayer-template";
    }

    static get observedAttributes()
    {
        return [ "axial-grid-tcol", "axial-grid-trow" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-grid-tcol" )
        {
            if( CSS.supports("grid-template-columns", newValue) === true ) 
            {
                this.#cssColumns = newValue;
                if( this.#grid )
                {
                    this.#grid.style.gridTemplateColumns = newValue;
                }
            }
        }

        if( name === "axial-grid-trow" )
        {
            if( CSS.supports("grid-template-rows", newValue) === true ) 
            {
                this.#cssRows = newValue;
                if( this.#grid )
                {
                    this.#grid.style.gridTemplateRows = newValue;
                }
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#grid = this.shadowRoot.querySelector("#grid");
        if( this.#grid )
        {
            if( this.#cssColumns ) { this.#grid.style.gridTemplateColumns = this.#cssColumns; }
            if( this.#cssRows ) { this.#grid.style.gridTemplateRows = this.#cssRows; }
        }

        this.#gridSlot = this.shadowRoot.querySelector("#gridSlot");
        const ae = this.#gridSlot.assignedElements();
        for( const e of ae )
        {
            if( e instanceof AxialCardBase )
            {
                this.#cards.push( e );
            }
        }
    }

    async refreshCards()
    {
        //console.log("refresh cards");
        for( const card of this.#cards )
        {
            await card.loadGetData();
        }
    }
}

window.customElements.define( "axial-card-displayer", AxialCardDisplayer );
export { AxialCardDisplayer }