"use strict";

import { PathUtils } from "../../utils/PathUtils.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { AxialListItem } from "../../list/AxialListItem.js";
import { AxialToggleSwitch } from "../../button/AxialToggleSwitch.js";

class AxialModuleSubscriptionListItem extends AxialListItem
{
    /// elements
    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #price;

    /** @type { HTMLElement } */
    #recurrence;
    
    /** @type { HTMLElement } */
    #state;

    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { HTMLElement } */
    #creation;

    /** @type { HTMLElement } */
    #actions;

    /** @type { Map } */
    #recurrenceValues = new Map( [ ["day", "Quotidienne"], ["week", "Hebdomadaire" ], ["month", "Mensuelle" ], ["year", "Annuelle"] ] );

    constructor()
    {
        super();
        this.template = "axial-module-subscription-list-item-template";
    }

    _buildComponent()
    {
        this.#photo = this.shadowRoot.getElementById("photo");
        this.#name = this.shadowRoot.getElementById("name");
        this.#price = this.shadowRoot.getElementById("price");
        this.#recurrence = this.shadowRoot.getElementById("recurrence");
        this.#state = this.shadowRoot.getElementById("state");
        this.#switch = this.shadowRoot.getElementById("switch");
        this.#creation = this.shadowRoot.getElementById("creation");

        super._buildComponent();
    }

    _updateComponent()
    {
        super._updateComponent();
        
        if( this.data.image_main !== "" )
        {
            const relPath = "./api/file/get/" + this.data.image_main;
            this.#photo.style.backgroundImage = `url('${PathUtils.getPathFromRelative(relPath)}')`;
        }

        this.#name.innerHTML = this.data.subscription_name;
        this.#price.innerHTML = Number(this.data.price).toFixed(2) + "€";
        this.#recurrence.innerHTML = this.#recurrenceValues.get( this.data.recurrence );
        this.#creation.innerHTML = DateUtils.format( new Date(this.data.creation_date) );

        if( this.#switch && this.data.active === true )
        {
            this.#switch.selected = true;
        }
        
    }

}

window.customElements.define("axial-module-subscription-list-item", AxialModuleSubscriptionListItem);
export { AxialModuleSubscriptionListItem }