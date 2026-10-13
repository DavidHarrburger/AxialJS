"use strict";

import { AxialCard } from "../AxialCard.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialModuleBookingPopup } from "../../module/booking/AxialModuleBookingPopup.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialButton } from "../../button/AxialButton.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { AxialBookingConfirmationOverlay } from "../../booking/AxialBookingConfirmationOverlay.js";

class AxialCardBooking extends AxialCard
{
    /** @type { HTMLElement } */
    #requestState;

    /** @type { HTMLElement } */
    #confirmedState;

    /** @type { HTMLElement } */
    #datetime;

    /** @type { String } */
    #apiBookingGetPath = "./api/booking/get";

    /** @type { String } */
    #bookingPopupId = "bookingPopup";

    /** @type { AxialModuleBookingPopup o} */
    #bookingPopup;

    /** @type { String } */
    #bookingConfirmationOverlayId = "bookingConfirmationOverlay";

    /** @type { AxialBookingConfirmationOverlay } */
    #bookingConfirmationOverlay;

    /** @type { AxialButton } */
    #bookingButton;

    /** @type { AxialButton } */
    #cancelButton;

    /// events
    /** @type { Function } */
    #boundBookingHandler;

    /** @type { Function } */
    #boundCancelHandler;

    /** @type { Function } */
    #boundBookingCancelledHandler;

    constructor()
    {
        super();
        this.template = "axial-card-booking-template";
        this.#apiBookingGetPath = PathUtils.getPathFromRelative(this.#apiBookingGetPath);
        this.getPath = this.#apiBookingGetPath;

        this.#boundBookingHandler = this.#bookingHandler.bind(this);
        this.#boundCancelHandler = this.#cancelHandler.bind(this);

        this.#boundBookingCancelledHandler = this.#bookingCancelledHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#requestState = this.shadowRoot.getElementById("requestState");
        this.#confirmedState = this.shadowRoot.getElementById("confirmedState");
        this.#datetime = this.shadowRoot.getElementById("datetime");

        this.#bookingPopup = AxialPopupManager.getPopupById( this.#bookingPopupId );

        this.#bookingButton = this.shadowRoot.getElementById("bookingButton");
        this.#bookingButton.addEventListener("click", this.#boundBookingHandler );

        this.#cancelButton = this.shadowRoot.getElementById("cancelButton");
        this.#cancelButton.addEventListener("click", this.#boundCancelHandler );

        this.#bookingConfirmationOverlay = document.getElementById( this.#bookingConfirmationOverlayId );
        this.#bookingConfirmationOverlay.addEventListener("bookingCancelled", this.#boundBookingCancelledHandler);
    }

    _onGetResponse()
    {
        super._onGetResponse();
        //console.log( "coucou booking", this.getData);
        if( this.getData.content == null || this.getData.content.has == false )
        {
            this.#requestState.style.display = "flex";
            this.#confirmedState.style.display = "none";
        }
        else
        {
            this.#requestState.style.display = "none";
            this.#confirmedState.style.display = "flex";

            const booking = this.getData.content.booking;
            console.log(booking);
            const date = new Date( booking.booking_date );
            //console.log( date.getDate() );
            const start = booking.booking_start;
            const end = booking.booking_end;

            const locale = DateUtils.toLocale( date );
            const time = `de ${start}h à ${end}h.`;

            const address = `${booking.address_line_1} ${booking.address_zip} ${booking.address_city}`;

            this.#datetime.innerHTML = "Vous avez rendez-vous le :<br>" + locale  + " " + time + "<br>à cette adresse : <br>" + address;
        }
    }

    #bookingHandler( event )
    {
        if( this.#bookingPopup )
        {
            this.#bookingPopup.show();
        }
    }

    #cancelHandler( event )
    {
        if( this.getData?.content?.booking )
        {
            
            if( this.#bookingConfirmationOverlay )
            {
                this.#bookingConfirmationOverlay.data = this.getData.content.booking;
                this.#bookingConfirmationOverlay.show();
            }
        }
    }

    #bookingCancelledHandler( event )
    {
        this.loadGetData();
    }
}

window.customElements.define("axial-card-booking", AxialCardBooking);
export { AxialCardBooking }