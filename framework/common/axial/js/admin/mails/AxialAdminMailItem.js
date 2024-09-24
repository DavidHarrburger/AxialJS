"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminMailItem extends AxialComponentBase
{
    /// vars
    #index = -1;
    
    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #email;

    /** @type { HTMLElement } */
    #date;

    /// events
    /** @type { Function } */
    #boundPointerEnterHandler;

    /** @type { Function } */
    #boundPointerLeaveHandler;

    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_mail_item");
        this.template = "axial-admin-mail-item-template";

        this.#boundPointerEnterHandler = this.#pointerEnterHandler.bind(this);
        this.#boundPointerLeaveHandler = this.#pointerLeaveHandler.bind(this);
        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    get index() { return this.#index; }
    set index( value )
    {
        if( isNaN( value ) === true )
        {
            throw new TypeError("Positive or Zero Number value required");
        }
        if( value < 0 )
        {
            throw new TypeError("Positive or Zero Number value required");
        }
        this.#index = value;
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#background = this.shadowRoot.getElementById("background");
        this.#email = this.shadowRoot.getElementById("email");
        this.#date = this.shadowRoot.getElementById("date");

        this.addEventListener("pointerenter", this.#boundPointerEnterHandler);
        this.addEventListener("pointerleave", this.#boundPointerLeaveHandler);
        this.addEventListener("click", this.#boundClickHandler);
    }

    #pointerEnterHandler( event )
    {
        if( this.#background )
        {
            this.#background.style.opacity = "1";
        }
    }

    #pointerLeaveHandler( event )
    {
        if( this.#background )
        {
            this.#background.style.opacity = "0";
        }
    }

    #clickHandler( event )
    {
        const mailPopup = AxialPopupManager.getPopupById("mailPopup");
        if( mailPopup )
        {
            console.log( this.#index);
            mailPopup.mailViewer.currentIndex = this.#index;
            mailPopup.show();
        }
    }

    _onDataChanged()
    {
        try
        {
            this.#email.innerHTML = this.data.email;
            const mailDate = new Date( this.data.date );
            this.#date.innerHTML = "reçu le " + DateUtils.format( mailDate );
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-admin-mail-item", AxialAdminMailItem);
export { AxialAdminMailItem }