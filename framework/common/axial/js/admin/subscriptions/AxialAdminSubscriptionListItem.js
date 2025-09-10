"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminSubscriptionListItem extends AxialAdminListItemBase
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

    /** @type { HTMLElement } */
    #creation;

    /** @type { HTMLElement } */
    #actions;

    /** @type { Map } */
    #recurrenceValues = new Map( [ ["day", "Quotidienne"], ["week", "Hebdomadaire" ], ["month", "Mensuelle" ], ["year", "Annuelle"] ] );

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-subscription-list-item-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#photo = this.shadowRoot.getElementById("photo");
        this.#name = this.shadowRoot.getElementById("name");
        this.#price = this.shadowRoot.getElementById("price");
        this.#recurrence = this.shadowRoot.getElementById("recurrence");
        this.#state = this.shadowRoot.getElementById("state");
        this.#creation = this.shadowRoot.getElementById("creation");
        
        this.#actions = this.shadowRoot.getElementById("actions");

        this.#updateComponent();
    }

    _onDataChanged()
    {
        this.#updateComponent();
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            if( this.data.image_main !== "" )
            {
                this.#photo.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.data.image_main)}')`;
            }

            this.#name.innerHTML = this.data.product_name;
            this.#price.innerHTML = Number(this.data.price).toFixed(2) + "€";
            this.#recurrence.innerHTML = this.#recurrenceValues.get( this.data.recurrence );
            this.#creation.innerHTML = DateUtils.format( new Date(this.data.creation_date) );
        
        }
    }

}

window.customElements.define("axial-admin-subscription-list-item", AxialAdminSubscriptionListItem);
export { AxialAdminSubscriptionListItem }