"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";
import { AxialListOverlayButton } from "./AxialListOverlayButton.js";
import { AxialInputBase } from "../core/AxialInputBase.js";
import { DomUtils } from "../utils/DomUtils.js";

class AxialListOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { Array } */
    #values;

    /// elements
    /** @type { HTMLElement } */
    #group;

    /// events
    /** @type { Function } */
    #boundButtonClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_list_overlay");
        this.template = "axial-list-overlay-template";
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get group() { return this.#group; }

    get values() { return this.#values; }
    set values( value )
    {
        
        if( Array.isArray(value) === false ) { throw new TypeError("Array required"); }
        this.#values = value;
        if( this.#group )
        {
            DomUtils.cleanElement( this.#group );
            const l = this.#values.length;
            for( let i = 0; i < l; i++ )
            {
                const button = new AxialListOverlayButton();
                button.text = this.#values[i].label;
                button.data = this.#values[i].value;
                button.addEventListener( "click", this.#boundButtonClickHandler);
                this.#group.appendChild( button );
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#group = this.shadowRoot.getElementById("group");

        if( this.#group )
        {
            if( this.#values !== undefined && this.#values.length > 0 )
            {
                DomUtils.cleanElement( this.#group );
                const l = this.#values.length;
                for( let i = 0; i < l; i++ )
                {
                    const button = new AxialListOverlayButton();
                    button.text = this.#values[i].label;
                    button.data = this.#values[i].value;
                    button.addEventListener( "click", this.#boundButtonClickHandler);
                    this.#group.appendChild( button );
                }
            }
            else if( this.#group.children.length > 0 )
            {
                for( const child of this.#group.children )
                {
                    if( child instanceof AxialListOverlayButton === true )
                    {
                        console.log("button found");
                        child.addEventListener("click", this.#boundButtonClickHandler);
                    }
                }
            }
        }

        /*
        if( this.#values && this.#group )
        {
            //console.log("should update data")
            
        }
        */
    }

    #buttonClickHandler( event )
    {
        console.log( "button in overlay list click" )
        const button = event.target;

        const index = Array.from(this.#group.children).indexOf( button );
        const label = button.text;
        const value = button.data;

        const listOverlayData = 
        {
            index: index,
            label: label,
            value: value
        }

        const listOverlayEvent = new CustomEvent("listOverlayChanged", { bubbles: true, detail: listOverlayData } );
        this.dispatchEvent(listOverlayEvent);

        /// WARNING SUPER DELICAT
        /// .value ne prend pas avant le blur, petit tour de magie mais à revoir
        
        if( this.target instanceof AxialInputBase )
        {
            this.target.forceValue( label );
        }
        
        this.hide();
    }
}

window.customElements.define("axial-list-overlay", AxialListOverlay);
export { AxialListOverlay }