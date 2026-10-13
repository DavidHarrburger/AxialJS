"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js"
import { FetchUtils } from "../utils/FetchUtils.js";
import { PathUtils } from "../utils/PathUtils.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialBookingConfirmationOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { Object } */
    #MODES = Object.freeze( { cancel: "cancel", confirm: "confirm" } );

    /** @type { String } */
    #mode = "cancel" // "cancel"

    /** @type { String } */
    #apiBookingCancelPath = "./api/booking/cancel";

    /// elements
    /** @type { HTMLElement } */
    #info;
    
    /** @type { AxialButton } */
    #backButton;

    /** @type { AxialServiceButton } */
    #validationButton;

    /// events
    /** @type { Function } */
    #boundBackHandler;

    /** @type { Function } */
    #boundValidationHandler;

    constructor()
    {
        super();
        this.classList.add("axial_booking_confirmation_overlay")
        this.template = "axial-booking-confirmation-overlay-template";

        this.#apiBookingCancelPath = PathUtils.getPathFromRelative( this.#apiBookingCancelPath );

        this.#boundBackHandler = this.#backHandler.bind(this);
        this.#boundValidationHandler = this.#validationHandler.bind(this);

        //this.useObfuscator = true;
        //this.isModal = true;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#info = this.shadowRoot.getElementById("info");
        this.#backButton = this.shadowRoot.getElementById("backButton");
        this.#validationButton = this.shadowRoot.getElementById("validationButton");

        this.#backButton.addEventListener("click", this.#boundBackHandler);
        this.#validationButton.addEventListener("click", this.#boundValidationHandler);

        this.displayMode = "center";
        this.isModal = true;
        this.useObfuscator = true;
    }

    _onDataChanged()
    {
        const booking = this.data;
        
        const date = new Date( booking.booking_date );
        const start = booking.booking_start;
        const end = booking.booking_end;

        const locale = DateUtils.toLocale( date );
        const time = `de ${start}h à ${end}h.`;

        const address = `${booking.address_line_1} ${booking.address_zip} ${booking.address_city}`;

        const message = `Vous souhaitez annuler votre RDV prévu le ${locale} ${time} à l'adresse suivante : ${address}`;
        this.#info.innerHTML = message;
    }

    #backHandler( event )
    {
        this.hide();
    }

    #validationHandler( event )
    {
        this.#cancelBooking();
    }

    async #cancelBooking()
    {
        try
        {
            const payload = { _id: this.data._id };
            const json = await FetchUtils.POST( this.#apiBookingCancelPath, payload );
            if( json.status === "ok" )
            {
                this.hide();
                window.AXIAL.notify("Votre RDV a bien été supprimé");
                const bookingEvent = new CustomEvent("bookingCancelled", { bubbles: true, composed: true } );
                this.dispatchEvent(bookingEvent);
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

}

window.customElements.define("axial-booking-confirmation-overlay", AxialBookingConfirmationOverlay);
export { AxialBookingConfirmationOverlay }
