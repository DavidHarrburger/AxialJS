"use strict";

import { AxialToggleButtonBase } from "../button/AxialToggleButtonBase.js";
import { PathUtils } from "../utils/PathUtils.js";
import { ColorUtils } from "../utils/ColorUtils.js";

class AxialSubscriptionCard extends AxialToggleButtonBase
{
    /// vars
    /** @type { Map } */
    #recurrenceValues = new Map( [ ["day", "par jour"], ["week", "par semaine" ], ["month", "par mois" ], ["year", "par an"] ] );

    /** @type { Object } */
    #colors;

    /// elements
    /** @type { HTMLElement } */
    #image;

    /** @type { HTMLElement } */
    #title;

    /** @type { HTMLElement } */
    #price;

    constructor()
    {
        super();
        this.classList.add("axial_subscription_card");
        this.template = "axial-subscription-card-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#image = this.shadowRoot.getElementById("image");
        this.#title = this.shadowRoot.getElementById("title");
        this.#price = this.shadowRoot.getElementById("price");

        if( this.data !== undefined )
        {
            this.#updateComponent();
        }
    }

    /**
     * @type { Object }
     * @readonly
     */
    get colors() { return this.#colors; }

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
        const recurrence = this.#recurrenceValues.get(this.data.recurrence);

        this.#image.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.data.image_main)}')`;
        this.#title.innerHTML = this.data.product_name;
        this.#price.innerHTML = this.data.price + "€ " + recurrence;

        if( ColorUtils.MEDALS_COLORS.has( this.data.product_ref ) )
        {
            this.#colors = ColorUtils.MEDALS_COLORS.get( this.data.product_ref );
            console.log( this.#colors );
            this.style.borderColor = this.#colors.dark;
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #enterHandler( event )
    {
        if( this.selected === false )
        {
            
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        if( this.selected === false )
        {
            
        }
    }

    _onToggleChanged()
    {
        if( this.selected === false )
        {
            
        }
        else
        {
            
        }
    }
}

window.customElements.define("axial-subscription-card", AxialSubscriptionCard);
export { AxialSubscriptionCard }