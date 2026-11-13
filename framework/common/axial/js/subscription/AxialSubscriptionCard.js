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

    /** @type { Boolean } */
    #mandatory = false;

    /** @type { String } */
    #imagePath = "./api/file/get/";

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
        const image = PathUtils.getPathFromRelative( this.#imagePath + this.data.image_main );

        this.#image.style.backgroundImage = `url('${image}')`;
        this.#title.innerHTML = this.data.subscription_name;
        this.#price.innerHTML = this.data.price + "€ " + recurrence;
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
        const color = this.selected === true ? "#232323" : "#f4f4f4";
        this.style.borderColor = color;
    }
}

window.customElements.define("axial-subscription-card", AxialSubscriptionCard);
export { AxialSubscriptionCard }