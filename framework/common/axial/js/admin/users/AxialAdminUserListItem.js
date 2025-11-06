"use strict";

import { AxialAdminListItemBase } from "../base/AxialAdminListItemBase.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialAdminUserListItem extends AxialAdminListItemBase
{
    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #email;

    /** @type { HTMLElement } */
    #role;
    
    /** @type { HTMLElement } */
    #accountImage;

    /** @type { HTMLElement } */
    #accountName;

    /** @type { HTMLElement } */
    #accountPrice;

    /** @type { HTMLElement } */
    #status;

    /** @type { HTMLElement } */
    #newsletter;

    /** @type { HTMLElement } */
    #creation;

    /// vars
    /** @type { Object } */
    #subscription;

    constructor()
    {
        super();
        this.template = "axial-admin-user-list-item-template";
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#role = this.shadowRoot.getElementById("role");
        this.#accountImage = this.shadowRoot.getElementById("accountImage");
        this.#accountName = this.shadowRoot.getElementById("accountName");
        this.#accountPrice = this.shadowRoot.getElementById("accountPrice");
        this.#status = this.shadowRoot.getElementById("status");
        this.#newsletter = this.shadowRoot.getElementById("newsletter");
        this.#creation = this.shadowRoot.getElementById("creation");

        this.#updateComponent();
    }

    _onDataChanged()
    {
        this.#updateComponent();
    }

    #getSubscription()
    {
        if( this.data && this.data.subscriptions )
        {
            const product = this.data.stripe_subscription_product_id;
            const price = this.data.stripe_subscription_price_id;
            for( const s of this.data.subscriptions )
            {
                if( s.stripe_product_id === product && s.stripe_price_id === price )
                {
                    this.#subscription = s;
                    break;
                }
            }
        }
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            //this.#getSubscription();

            this.#name.innerHTML = this.data.first_name + " " + this.data.last_name;
            this.#email.innerHTML = this.data.email;
            this.#role.innerHTML = this.data.role;

            /*
            const currentStatus = this.data.stripe_subscription_status;
            const currentColor = currentStatus === "active" ? ColorUtils.UI_COLORS.get("success") : ColorUtils.UI_COLORS.get("error");

            this.#accountImage.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.#subscription.image_main)}')`;
            this.#accountName.innerHTML = this.#subscription.product_name;
            this.#accountPrice.innerHTML = Number(this.#subscription.price).toFixed(2) + " / " + this.#subscription.recurrence ;
            
            this.#status.innerHTML = currentStatus;
            this.#status.style.color = currentColor.mid_dark;
            */

            this.#creation.innerHTML = DateUtils.format( new Date( this.data.creation_date ) );
        }
    }
}

window.customElements.define("axial-admin-user-list-item", AxialAdminUserListItem);
export { AxialAdminUserListItem }